import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { INK_DRAPE, INK_GROW, INK_SWAY, INK_WRITE, type InkVariant } from "../ink/config";

/**
 * TIÊU ĐỀ CHỮ LÁ — chuyển động.
 * HTML server render ra trạng thái CUỐI (chữ đủ, lá đủ, cây đủ); setInkInitial() mới ẩn đi để chạy lại.
 *
 *  1. Viết: ngòi bút chạy dọc đường tâm từng nét (stroke-dashoffset), nét sau chờ nét trước — như tay viết.
 *  2. Mọc lá: buildInkTimeline() rải các chồi hình lá dọc mỗi nét (trong mask của lớp lá); chồi lớn dần
 *     ngay khi đầu bút đi qua. Viết xong một từ, phần còn hở được lấp kín ([data-ink-full]).
 *  3. Cây: viết xong từ nào thì cây của từ đó mọc — lá vắt rơi xuống đỉnh chữ rồi rủ, hoa nở, mầm nhú.
 */

const SVG_NS = "http://www.w3.org/2000/svg";
/** Chồi hình lá dài 1 đơn vị: cuống ở (0,0), chóp ở (0,−1) */
const BUD_D = "M0 0C-.42-.2-.46-.72 0-1C.46-.72.42-.2 0 0Z";

const all = <T extends Element>(el: Element, sel: string) => Array.from(el.querySelectorAll<T>(sel));
const wordIndex = (node: Element) => Number(node.closest<SVGElement>("[data-ink-word]")?.dataset.inkWord ?? 0);

/** PRNG có seed: cùng một tiêu đề luôn ra cùng một bộ chồi lá */
function rng(text: string) {
  let a = 2166136261;
  for (const c of text) a = Math.imul(a ^ c.charCodeAt(0), 16777619);
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), a | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * "Nướng" hiệu ứng 3D của lớp lá thành 2 ảnh bitmap: bóng đổ (dưới lá) và mép sáng/tối (trên lá).
 * Bộ lọc SVG nằm dưới mask đang chạy bị trình duyệt tính lại MỖI khung hình (intro tụt còn ~40 fps).
 * Hiệu ứng chỉ phụ thuộc hình dạng chữ (SourceAlpha của lá đã cắt = đường viền chữ), nên vẽ một lần
 * bằng Canvas 2D rồi dùng ảnh — mask chạy trên ảnh thì rẻ.
 * Mỗi từ vẽ trong một tác vụ riêng (không chặn intro); hero trước, tiêu đề khác lúc trình duyệt rảnh.
 * Chưa vẽ xong thì vẫn là bộ lọc gốc. Gọi nhiều lần không sao (data-baked).
 */
const bakeQueue: { svg: SVGSVGElement; urgent: boolean }[] = [];
let baking = false;

function bakeBevel(el: HTMLElement) {
  const urgent = el.dataset.inkVariant === "hero";
  for (const svg of all<SVGSVGElement>(el, "[data-ink-word]")) {
    const leaves = svg.querySelector<SVGGElement>("[data-ink-leaves]");
    if (!leaves || leaves.dataset.baked) continue;
    leaves.dataset.baked = "queued";
    if (urgent) bakeQueue.unshift({ svg, urgent });
    else bakeQueue.push({ svg, urgent });
  }
  pumpBake();
}

function pumpBake() {
  if (baking || !bakeQueue.length) return;
  baking = true;
  const next = () => {
    baking = false;
    const job = bakeQueue.shift();
    if (!job) return;
    try {
      bakeWord(job.svg);
    } catch {
      const leaves = job.svg.querySelector<SVGGElement>("[data-ink-leaves]");
      if (leaves) delete leaves.dataset.baked; // giữ bộ lọc gốc
    }
    pumpBake();
  };
  const head = bakeQueue[0];
  if (head.urgent || typeof requestIdleCallback !== "function") setTimeout(next, 0);
  else requestIdleCallback(next, { timeout: 1500 });
}

function bakeWord(svg: SVGSVGElement) {
  const leaves = svg.querySelector<SVGGElement>("[data-ink-leaves]");
  const live = leaves?.querySelector<SVGGElement>("[filter]");
  const filter = svg.querySelector("filter");
  const outline = svg.querySelector("clipPath path")?.getAttribute("d");
  if (!leaves || !live || !filter || !outline || !svg.isConnected) return;

  // Tham số đọc thẳng từ <filter> (InkHeading.tsx) để hai nơi không lệch nhau.
  // Thứ tự feOffset/feFlood: 0 bóng đổ · 1 mép tối · 2 mép sáng
  const sigma = Number(filter.querySelector("feGaussianBlur")?.getAttribute("stdDeviation") ?? 16);
  const offsets = Array.from(filter.querySelectorAll("feOffset")).map((o) => [Number(o.getAttribute("dx")), Number(o.getAttribute("dy"))]);
  const floods = Array.from(filter.querySelectorAll("feFlood")).map((f) => {
    const n = parseInt((f.getAttribute("flood-color") ?? "#000").slice(1), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${Number(f.getAttribute("flood-opacity") ?? 1)})`;
  });
  if (offsets.length < 3 || floods.length < 3) throw new Error("filter");

  // Vùng ảnh = khung chữ + lề đủ cho độ nhòe và độ dời bóng
  const vb = svg.viewBox.baseVal;
  const pad = 3 * sigma + Math.max(...offsets.flat().map(Math.abs));
  const [X, Y, Wd, Ht] = [vb.x - pad, vb.y - pad, vb.width + 2 * pad, vb.height + 2 * pad];
  // Độ phân giải = cỡ đang hiển thị × devicePixelRatio (tối đa 4096px mỗi chiều)
  const unitPx = (svg.getBoundingClientRect().width / (vb.width || 1)) * (window.devicePixelRatio || 1);
  const scale = Math.min(unitPx || 0.1, 4096 / Wd, 4096 / Ht);
  const shape = new Path2D(outline);
  const ring = new Path2D();
  ring.rect(X - pad, Y - pad, Wd + 2 * pad, Ht + 2 * pad);
  ring.addPath(shape);

  /**
   * shadowBlur = 2σ, shadowOffset dời bóng như feOffset. Hình thật vẽ dời ra ngoài canvas `far` đơn vị,
   * bóng kéo ngược về → chỉ còn bóng.
   *  - bóng đổ = bóng của chữ
   *  - mép tối / sáng = bóng của phần NGOÀI chữ, cắt trong chữ (= SourceAlpha out bóng dời)
   */
  const paint = (layers: { inner: boolean; at: number }[]) => {
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(Wd * scale));
    c.height = Math.max(1, Math.round(Ht * scale));
    // Canvas nhỏ, vẽ trên CPU: canvas GPU phải đọc ngược pixel về khi toBlob → chặn luồng chính ~170ms/ảnh
    const ctx = c.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new Error("canvas");
    const far = 2 * (Wd + 2 * pad);
    for (const { inner, at } of layers) {
      const [dx, dy] = offsets[at];
      ctx.save();
      ctx.setTransform(scale, 0, 0, scale, -X * scale, -Y * scale);
      if (inner) ctx.clip(shape);
      ctx.shadowColor = floods[at];
      ctx.shadowBlur = 2 * sigma * scale;
      ctx.shadowOffsetX = (dx - far) * scale;
      ctx.shadowOffsetY = dy * scale;
      ctx.translate(far, 0);
      if (inner) ctx.fill(ring, "evenodd");
      else ctx.fill(shape);
      ctx.restore();
    }
    return new Promise<string>((res, rej) => c.toBlob((b) => (b ? res(URL.createObjectURL(b)) : rej(new Error("toBlob")))));
  };
  const image = (href: string) => {
    const img = document.createElementNS(SVG_NS, "image");
    img.setAttribute("href", href);
    img.setAttribute("preserveAspectRatio", "none");
    Object.entries({ x: X, y: Y, width: Wd, height: Ht }).forEach(([k, v]) => img.setAttribute(k, String(v)));
    return img;
  };

  Promise.all([
    paint([{ inner: false, at: 0 }]),
    paint([
      { inner: true, at: 1 },
      { inner: true, at: 2 },
    ]),
  ])
    .then(([under, over]) => {
      if (!live.isConnected) return;
      live.removeAttribute("filter");
      leaves.insertBefore(image(under), live);
      leaves.appendChild(image(over));
      leaves.dataset.baked = "1";
    })
    .catch(() => {
      delete leaves.dataset.baked; // giữ bộ lọc gốc
    });
}

/** Ẩn nét, lớp lá, cây. Gọi trước khi trang thêm .is-ready / trước khi cuộn tới. */
export function setInkInitial(el: HTMLElement): void {
  bakeBevel(el);
  // Gán style thẳng: gsap.set đọc computed style của từng nét (vài chục nét × mọi tiêu đề) → chậm lúc tải
  for (const s of all<SVGElement>(el, "[data-ink-stroke]")) {
    s.style.strokeDasharray = "1 1";
    s.style.strokeDashoffset = "1";
    s.style.opacity = "0";
  }
  for (const f of all<SVGElement>(el, "[data-ink-full]")) f.style.opacity = "0";
  for (const buds of all(el, "[data-ink-buds]")) buds.replaceChildren();
  const plants = all(el, "[data-ink-plant]");
  if (plants.length) gsap.set(plants, { svgOrigin: "0 0", opacity: 0, scale: 0 });
}

interface StrokeTime {
  el: SVGPathElement;
  word: number;
  at: number;
  dur: number;
}

/** Lịch viết: mỗi nét bắt đầu lúc nào, chạy bao lâu (đã co giãn theo thời lượng của biến thể) */
function planStrokes(el: HTMLElement, variant: InkVariant, lite: boolean) {
  const W = INK_WRITE;
  const list: StrokeTime[] = [];
  let t = 0;
  let prev: { word: number; glyph?: string } | undefined;
  for (const s of all<SVGPathElement>(el, "[data-ink-stroke]")) {
    const word = wordIndex(s);
    if (prev) t += word !== prev.word ? W.wordGap : s.dataset.glyph !== prev.glyph ? W.glyphGap : W.lift;
    const dur = gsap.utils.clamp(W.minStroke, W.maxStroke, (Number(s.dataset.len) || 600) / W.speed);
    list.push({ el: s, word, at: t, dur });
    t += dur;
    prev = { word, glyph: s.dataset.glyph };
  }
  const D = variant === "hero" ? W.duration.hero : W.duration.section;
  const target = variant === "hero" ? D[lite ? "lite" : "full"] : Math.min(t, D[lite ? "lite" : "full"]);
  const k = t > 0 ? target / t : 1;
  for (const s of list) {
    s.at *= k;
    s.dur *= k;
  }
  const wordEnd = new Map<number, number>();
  for (const s of list) wordEnd.set(s.word, Math.max(wordEnd.get(s.word) ?? 0, s.at + s.dur));
  return { list, end: list.length ? target : 0, wordEnd };
}

/** Lúc viết xong (giây) — rẻ, không dựng timeline. Dùng để canh lịch trước khi tiêu đề được cuộn tới. */
export function inkWrittenAt(el: HTMLElement, { lite = false }: { lite?: boolean } = {}): number {
  return planStrokes(el, (el.dataset.inkVariant || "hero") as InkVariant, lite).end;
}

/** Bút đi được tỉ lệ f quãng nét vào lúc nào (nghịch đảo của ease sine.inOut) */
const timeAt = (f: number) => Math.acos(1 - 2 * Math.min(1, Math.max(0, f))) / Math.PI;

/**
 * Đường tâm nét → đường gấp khúc (đơn vị font). Nét sinh ra chỉ có m/l/c/a dạng tương đối (xem build.mjs);
 * tự lấy mẫu nhanh hơn getPointAtLength hàng chục lần và không bị pathLength=1 đổi thang đo.
 */
function flatten(d: string) {
  const tok = d.match(/[mlca]|-?(?:\d*\.\d+|\d+)(?:e[-+]?\d+)?/gi) ?? [];
  const pts: [number, number][] = [];
  let i = 0;
  let cmd = "";
  let x = 0;
  let y = 0;
  const num = () => Number(tok[i++]);
  while (i < tok.length) {
    if (/[a-z]/i.test(tok[i])) cmd = tok[i++];
    const rel = cmd === cmd.toLowerCase();
    const ox = rel ? x : 0;
    const oy = rel ? y : 0;
    const c = cmd.toLowerCase();
    if (c === "m" || c === "l") {
      x = ox + num();
      y = oy + num();
      pts.push([x, y]);
      if (c === "m") cmd = rel ? "l" : "L"; // cặp số sau m là lineto
    } else if (c === "c") {
      const [x1, y1, x2, y2, ex, ey] = [ox + num(), oy + num(), ox + num(), oy + num(), ox + num(), oy + num()];
      for (let k = 1; k <= 16; k++) {
        const t = k / 16;
        const u = 1 - t;
        pts.push([
          u * u * u * x + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * ex,
          u * u * u * y + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * ey,
        ]);
      }
      x = ex;
      y = ey;
    } else if (c === "a") {
      let rx = Math.abs(num());
      let ry = Math.abs(num());
      const phi = (num() * Math.PI) / 180;
      const large = num() !== 0;
      const sweep = num() !== 0;
      const ex = ox + num();
      const ey = oy + num();
      // SVG arc: điểm đầu/cuối → tâm + góc (SVG 1.1, phụ lục F.6.5)
      const cos = Math.cos(phi);
      const sin = Math.sin(phi);
      const dx = (x - ex) / 2;
      const dy = (y - ey) / 2;
      const x1p = cos * dx + sin * dy;
      const y1p = -sin * dx + cos * dy;
      const lam = (x1p * x1p) / (rx * rx) + (y1p * y1p) / (ry * ry);
      if (lam > 1) {
        rx *= Math.sqrt(lam);
        ry *= Math.sqrt(lam);
      }
      const num2 = rx * rx * ry * ry - rx * rx * y1p * y1p - ry * ry * x1p * x1p;
      const co = (large === sweep ? -1 : 1) * Math.sqrt(Math.max(0, num2 / (rx * rx * y1p * y1p + ry * ry * x1p * x1p)));
      const cxp = (co * rx * y1p) / ry;
      const cyp = (-co * ry * x1p) / rx;
      const cx = cos * cxp - sin * cyp + (x + ex) / 2;
      const cy = sin * cxp + cos * cyp + (y + ey) / 2;
      const ang = (ux: number, uy: number) => Math.atan2(uy, ux);
      const a0 = ang((x1p - cxp) / rx, (y1p - cyp) / ry);
      let da = ang((-x1p - cxp) / rx, (-y1p - cyp) / ry) - a0;
      if (sweep && da < 0) da += 2 * Math.PI;
      if (!sweep && da > 0) da -= 2 * Math.PI;
      const n = Math.max(4, Math.ceil(Math.abs(da) / (Math.PI / 24)));
      for (let k = 1; k <= n; k++) {
        const a = a0 + (da * k) / n;
        pts.push([cx + rx * Math.cos(a) * cos - ry * Math.sin(a) * sin, cy + rx * Math.cos(a) * sin + ry * Math.sin(a) * cos]);
      }
      x = ex;
      y = ey;
    } else {
      i++; // lệnh lạ: bỏ qua số
    }
  }
  const cum = [0];
  for (let k = 1; k < pts.length; k++) cum.push(cum[k - 1] + Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]));
  const L = cum[cum.length - 1] ?? 0;
  /** Điểm và góc tiếp tuyến (độ) ở quãng s */
  const at = (s: number) => {
    let k = 1;
    while (k < cum.length - 1 && cum[k] < s) k++;
    const [ax, ay] = pts[k - 1] ?? [0, 0];
    const [bx, by] = pts[k] ?? [ax, ay];
    const seg = cum[k] - cum[k - 1] || 1;
    const f = Math.min(1, Math.max(0, (s - cum[k - 1]) / seg));
    return { x: ax + (bx - ax) * f, y: ay + (by - ay) * f, deg: (Math.atan2(by - ay, bx - ax) * 180) / Math.PI };
  };
  return { L, at };
}

interface Bud {
  g: SVGGElement;
  /** "translate(..) rotate(..)" — phần cố định của transform */
  base: string;
  len: number;
  at: number;
  /** tiến độ đã ghi lần trước, để chỉ ghi DOM khi đổi */
  last: number;
}

/**
 * Rải chồi lá dọc các nét của một từ.
 * Đo trên một path TÁCH RỜI khỏi trang (chỉ có d, không pathLength, không style) rồi mới gắn chồi vào
 * DOM một lần: đo xen kẽ với sửa DOM bắt trình duyệt tính lại bố cục mỗi lần → từng đơ 3s khi tải trang.
 */
function plantBuds(svg: SVGSVGElement, strokes: StrokeTime[], seed: string, lite: boolean): Bud[] {
  const G = INK_GROW;
  const group = svg.querySelector("[data-ink-buds]");
  if (!group) return [];
  const rand = rng(seed);
  const step = lite ? G.liteStep : G.step;
  const out: Bud[] = [];
  const frag = document.createDocumentFragment();
  let side = 1;
  for (const st of strokes) {
    const { L, at } = flatten(st.el.getAttribute("d") ?? "");
    const first = Math.min(L / 2, step * (0.2 + 0.4 * rand()));
    for (let d = first; d <= L; d += step * (0.8 + 0.4 * rand())) {
      const p = at(d);
      const tangent = p.deg;
      side = -side;
      const spread = G.angle[0] + rand() * (G.angle[1] - G.angle[0]);
      const len = G.length[0] + rand() * (G.length[1] - G.length[0]);
      const jitter = (rand() - 0.5) * 40;
      const base = `translate(${(p.x + jitter).toFixed(1)} ${(p.y - jitter).toFixed(1)}) rotate(${(tangent + 90 + side * spread).toFixed(1)})`;
      const g = document.createElementNS(SVG_NS, "g");
      g.setAttribute("transform", `${base} scale(0)`);
      const bud = document.createElementNS(SVG_NS, "path");
      bud.setAttribute("d", BUD_D);
      g.appendChild(bud);
      frag.appendChild(g);
      out.push({ g, base, len, at: st.at + st.dur * timeAt(L ? d / L : 1) + G.lag, last: 0 });
    }
  }
  group.replaceChildren(frag);
  return out;
}

/**
 * Cho mọi chồi lớn dần bằng MỘT tween tiến độ: mỗi khung chỉ ghi transform của chồi đang đổi.
 * (Mỗi chồi một tween GSAP = vài trăm tween, mỗi cái đọc computed style lúc khởi tạo → rất chậm.)
 */
function growBuds(tl: gsap.core.Timeline, buds: Bud[]) {
  if (!buds.length) return;
  const G = INK_GROW;
  const ease = gsap.parseEase(G.ease);
  const start = Math.min(...buds.map((b) => b.at));
  const end = Math.max(...buds.map((b) => b.at)) + G.duration;
  const clock = { t: start };
  tl.fromTo(
    clock,
    { t: start },
    {
      t: end,
      duration: end - start,
      ease: "none",
      onUpdate() {
        for (const b of buds) {
          const p = Math.min(1, Math.max(0, (clock.t - b.at) / G.duration));
          if (p === b.last) continue;
          b.last = p;
          b.g.setAttribute("transform", `${b.base} scale(${(ease(p) * b.len).toFixed(1)})`);
        }
      },
    },
    start
  );
}

/** Lá vắt: rơi chao nghiêng xuống, chạm đỉnh chữ thì phiến lá đổ xuống theo trọng lực rồi nhún vài nhịp */
function drape(tl: gsap.core.Timeline, plant: SVGGElement, at: number) {
  const D = INK_DRAPE;
  tl.set(plant, { opacity: 0, x: 40, y: -D.fallFrom, rotation: -16, scaleX: 1, scaleY: 0.3 }, at)
    .to(plant, { opacity: 1, duration: 0.15, ease: "none" }, at)
    .to(plant, { y: 0, duration: D.fall, ease: "power2.in" }, at)
    .to(plant, { x: 0, rotation: 7, duration: D.fall, ease: "sine.inOut" }, at)
    // còn đang rơi: lá chao, lúc nghiêng lúc phẳng
    .to(plant, { keyframes: [{ scaleY: 0.5 }, { scaleY: 0.28 }], duration: D.fall, ease: "sine.inOut" }, at)
    // nằm lên mép chữ: phiến lá rơi thẳng xuống (nhanh dần), bật nhẹ, nhún rồi đứng yên
    .to(
      plant,
      {
        keyframes: [
          { scaleY: 1, duration: D.drop, ease: "power2.in" },
          { scaleY: 0.9, duration: 0.15, ease: "sine.out" },
          { scaleY: 1, duration: 0.17, ease: "sine.inOut" },
          { scaleY: 0.97, duration: 0.13, ease: "sine.inOut" },
          { scaleY: 1, duration: 0.15, ease: "sine.inOut" },
        ],
      },
      at + D.fall
    )
    .to(plant, { rotation: 0, duration: D.settle, ease: "elastic.out(1, 0.3)" }, at + D.fall);
}

/** Cây thường: lá đỡ xòe ra, hoa nở xoay, mầm nhú thẳng lên rồi xòe */
function grow(tl: gsap.core.Timeline, plant: SVGGElement, at: number) {
  const kind = plant.dataset.kind;
  if (kind === "drape") drape(tl, plant, at);
  else if (kind === "flower") {
    tl.fromTo(plant, { scale: 0, rotation: -60, opacity: 0 }, { scale: 1, rotation: 0, opacity: 1, duration: 0.6, ease: "back.out(2)" }, at);
  } else if (kind === "sprout") {
    tl.fromTo(plant, { scaleY: 0, scaleX: 0.3, opacity: 0 }, { scaleY: 1, opacity: 1, duration: 0.4, ease: "power2.out" }, at).to(
      plant,
      { scaleX: 1, duration: 0.35, ease: "back.out(2)" },
      at + 0.4
    );
  } else {
    tl.fromTo(plant, { scale: 0, rotation: -28, opacity: 0 }, { scale: 1, rotation: 0, opacity: 1, duration: 0.75, ease: "back.out(1.6)" }, at);
  }
}

/** Timeline viết + mọc lá + mọc cây của một tiêu đề. Luôn có label "written" = lúc viết xong. */
export function buildInkTimeline(el: HTMLElement, { lite = false }: { lite?: boolean } = {}): gsap.core.Timeline {
  const variant = (el.dataset.inkVariant || "hero") as InkVariant;
  const G = INK_GROW;
  const tl = gsap.timeline();
  const { list, end, wordEnd } = planStrokes(el, variant, lite);

  // 1. Ngòi bút
  for (const s of list) {
    tl.set(s.el, { opacity: 1 }, s.at).to(s.el, { strokeDashoffset: 0, duration: s.dur, ease: INK_WRITE.ease }, s.at);
  }
  tl.addLabel("written", end);

  // 2. Lá mọc theo nét, rồi lấp kín khi xong từ
  const buds: Bud[] = [];
  for (const svg of all<SVGSVGElement>(el, "[data-ink-word]")) {
    const wi = Number(svg.dataset.inkWord);
    buds.push(...plantBuds(svg, list.filter((s) => s.word === wi), `${el.dataset.ink}:${wi}`, lite));
    const full = svg.querySelector("[data-ink-full]");
    if (full) tl.to(full, { opacity: 1, duration: G.fill.duration, ease: "power1.inOut" }, (wordEnd.get(wi) ?? end) + G.fill.delay);
  }
  growBuds(tl, buds);

  // 3. Cây của từng từ, theo thứ tự trong plants.ts
  const perWord = new Map<number, number>();
  const plants = all<SVGGElement>(el, lite ? "[data-ink-plant][data-lite]" : "[data-ink-plant]").sort(
    (a, b) => Number(a.dataset.order) - Number(b.dataset.order)
  );
  for (const plant of plants) {
    const wi = wordIndex(plant);
    const k = perWord.get(wi) ?? 0;
    perWord.set(wi, k + 1);
    const done = (wordEnd.get(wi) ?? end) + G.fill.delay;
    const kind = plant.dataset.kind;
    const at =
      kind === "sprout"
        ? end + G.fill.delay + 0.4 // hạt giống nảy mầm sau cùng
        : kind === "drape"
          ? done
          : kind === "flower"
            ? done + 0.15 + k * 0.07
            : done - 0.1 + k * 0.05; // lá đỡ xòe ra trước hoa
    grow(tl, plant, at);
  }
  return tl;
}

/** Lá có [data-sway] đung đưa nhẹ quanh điểm tựa (hero, máy tính). Dừng khi ra khỏi màn hình. Trả về hàm dọn. */
export function startInkSway(el: HTMLElement): () => void {
  const D = INK_SWAY;
  const tweens = all<SVGGElement>(el, "[data-sway]").map((plant, i) =>
    gsap.to(plant, {
      rotation: `+=${D.deg}`,
      duration: D.duration[0] + ((D.duration[1] - D.duration[0]) * (i % 3)) / 2,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    })
  );
  if (!tweens.length) return () => {};
  const st = ScrollTrigger.create({
    trigger: el,
    start: "top bottom",
    end: "bottom top",
    onToggle: (self) => tweens.forEach((tw) => (self.isActive ? tw.play() : tw.pause())),
  });
  return () => {
    st.kill();
    tweens.forEach((tw) => tw.kill());
  };
}
