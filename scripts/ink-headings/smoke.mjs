import { spawn } from "node:child_process";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const BASE = (process.argv[2] || "http://localhost:3100").replace(/\/$/, "");
const ROOT = path.resolve(import.meta.dirname, "../..");
const SHOTS = path.join(ROOT, "assets-src", "ink", "_check");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const chromePath = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  path.join(process.env.LOCALAPPDATA || "", "Google/Chrome/Application/chrome.exe"),
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].find((p) => p && existsSync(p));

if (!chromePath) {
  console.error("Không tìm thấy Chrome/Edge. Đặt biến CHROME_PATH rồi chạy lại.");
  process.exit(1);
}

try {
  await fetch(BASE);
} catch {
  console.error(`Không kết nối được ${BASE}. Cần chạy server trước.`);
  process.exit(1);
}

const port = 9500 + Math.floor(Math.random() * 400);
const profile = path.join(os.tmpdir(), `gc-ink-smoke-${Date.now()}`);
const chrome = spawn(chromePath, [
  "--headless=new",
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${profile}`,
  "--no-first-run",
  "--hide-scrollbars",
  "about:blank",
]);

let wsUrl;
for (let i = 0; i < 60 && !wsUrl; i++) {
  try {
    const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
    wsUrl = list.find((t) => t.type === "page")?.webSocketDebuggerUrl;
  } catch {
    await sleep(200);
  }
}
const ws = new WebSocket(wsUrl);
await new Promise((r) => ws.addEventListener("open", r, { once: true }));
let msgId = 0;
const pending = new Map();
const listeners = [];
ws.addEventListener("message", (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) {
    pending.get(m.id)(m);
    pending.delete(m.id);
  } else if (m.method) listeners.forEach((fn) => fn(m));
});

const send = (method, params = {}) =>
  new Promise((res, rej) => {
    const id = ++msgId;
    pending.set(id, (m) => (m.error ? rej(new Error(m.error.message)) : res(m.result)));
    ws.send(JSON.stringify({ id, method, params }));
  });

const evaluate = async (expr) => {
  const r = await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.text);
  return r.result.value;
};

const consoleErrors = [];
const consoleWarnings = [];
listeners.push((m) => {
  if (m.method === "Runtime.exceptionThrown") consoleErrors.push(m.params.exceptionDetails.exception?.description ?? m.params.exceptionDetails.text);
  if (m.method === "Runtime.consoleAPICalled") {
    const text = m.params.args.map((a) => a.value ?? a.description).join(" ");
    if (m.params.type === "error") consoleErrors.push(text);
    if (m.params.type === "warning" && text.includes("hydration")) consoleWarnings.push(text);
  }
  if (m.method === "Log.entryAdded" && m.params.entry.level === "error") consoleErrors.push(`${m.params.entry.text} ${m.params.entry.url ?? ""}`);
});

await send("Page.enable");
await send("Runtime.enable");
await send("Log.enable");

const viewport = async (width, height, mobile) => {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile });
  await send("Emulation.setTouchEmulationEnabled", mobile ? { enabled: true, maxTouchPoints: 5 } : { enabled: false });
};

const shot = async (name) => {
  mkdirSync(SHOTS, { recursive: true });
  const r = await send("Page.captureScreenshot", { format: "png" });
  writeFileSync(path.join(SHOTS, name), Buffer.from(r.data, "base64"));
};

const wheel = (deltaY) => send("Input.dispatchMouseEvent", { type: "mouseWheel", x: 700, y: 450, deltaX: 0, deltaY });

const results = [];
const check = (name, ok, detail = "") => results.push({ name, ok: !!ok, detail });

try {
  // ---------- Desktop 1440px Hero Timeline ----------
  await viewport(1440, 900, false);
  const startNav = Date.now();
  await send("Page.navigate", { url: `${BASE}/` });

  // Mốc 0.4s
  await sleep(400);
  await shot("hero-1440-0.4s.png");

  // Mốc 1.0s
  await sleep(600);
  await shot("hero-1440-1.0s.png");

  // Mốc 1.6s
  await sleep(600);
  await shot("hero-1440-1.6s.png");

  // Mốc 2.4s
  await sleep(800);
  await shot("hero-1440-2.4s.png");

  // Mốc 3.5s
  await sleep(1100);
  await shot("hero-1440-3.5s.png");

  // Kiểm tra nút Bán ve chai ngay hiện trước 3.0s
  const ctaVisible = await evaluate(`(() => {
    const cta = document.querySelector('[data-hero-cta] a');
    if (!cta) return false;
    const style = getComputedStyle(cta);
    return style.opacity === '1' && style.visibility !== 'hidden';
  })()`);
  check("Desktop: Nút 'Bán ve chai ngay' hiển thị đầy đủ", ctaVisible);

  // Intro chữ lá dài hơn mốc 3.5s (viết 3.2s rồi lá vắt rơi, hoa nở) → chờ cho xong hẳn
  await sleep(3000);
  await shot("hero-1440-6.5s.png");

  // Kiểm tra hero: nét viết xong, lá phủ kín, chồi lá đã rải
  const heroInk = await evaluate(`(() => {
    const t = document.querySelector('#hero-title');
    const strokes = [...t.querySelectorAll('[data-ink-stroke]')];
    const full = [...t.querySelectorAll('[data-ink-full]')];
    return {
      written: strokes.length > 0 && strokes.every((s) => parseFloat(getComputedStyle(s).strokeDashoffset) === 0),
      covered: full.length > 0 && full.every((r) => getComputedStyle(r).opacity === '1'),
      buds: t.querySelectorAll('[data-ink-buds] path').length,
    };
  })()`);
  check("Desktop: Nét bút hero đã viết hết", heroInk.written);
  check("Desktop: Lớp lá đã phủ kín chữ hero", heroInk.covered);
  check("Desktop: Lá mọc theo nét (có chồi lá)", heroInk.buds > 100, `${heroInk.buds} chồi`);

  // Kiểm tra mọi cây hero đã mọc, lá vắt đã nằm yên trên đỉnh chữ
  const [heroGrown, heroTotal] = await evaluate(`(() => { const p = [...document.querySelectorAll('#hero-title [data-ink-plant]')]; return [p.filter((x) => getComputedStyle(x).opacity === '1').length, p.length]; })()`);
  check("Desktop: Mọi cây hero đã mọc (opacity 1)", heroTotal > 0 && heroGrown === heroTotal, `${heroGrown}/${heroTotal}`);
  const drapes = await evaluate(`[...document.querySelectorAll('#hero-title [data-kind=drape]')].map((p) => new DOMMatrix(getComputedStyle(p).transform).d.toFixed(2))`);
  check("Desktop: Lá vắt đã rủ hết xuống (scaleY ≈ 1)", drapes.length >= 2 && drapes.every((d) => Math.abs(d - 1) < 0.06), drapes.join(", "));

  // Cuộn thẳng tới từng tiêu đề (đi qua Lenis bằng scrollIntoView), chờ chuyển động chạy xong rồi chụp
  const scrollToSel = (sel, block = "center") =>
    evaluate(`document.querySelector(${JSON.stringify(sel)})?.scrollIntoView({ block: ${JSON.stringify(block)} })`);
  await scrollToSel("#features-title");
  await sleep(2500);
  await shot("features-title-1440.png");
  for (const n of [1, 2, 3]) {
    await scrollToSel(`[data-feature]:nth-child(${n})`);
    await sleep(2800);
    await shot(`features-${n}-1440.png`);
  }
  const featuresLeafy = await evaluate(`(() => {
    const t = document.querySelector('#features-title[data-ink-variant="leaf"]');
    return !!t && [...t.querySelectorAll('[data-ink-full]')].every((r) => getComputedStyle(r).opacity === '1');
  })()`);
  check("Features: Tiêu đề chữ lá như hero, đã viết xong", featuresLeafy);

  const featureNumbers = await evaluate(`[...document.querySelectorAll('[data-ink-number]')].filter((n) => n.dataset.inkVariant === 'leaf').length`);
  check("Features: Có 3 số chữ lá [data-ink-number]", featureNumbers === 3, `Tìm thấy: ${featureNumbers}`);

  await scrollToSel("#cta-title");
  await sleep(3000);
  await shot("cta-chalk-1440.png");

  const ctaChalkExists = await evaluate(`(() => {
    const chalk = document.querySelector('#cta-title[data-ink-variant="chalk"]');
    return !!chalk;
  })()`);
  check("CTA: Tiêu đề chalk tồn tại", ctaChalkExists);

  // ---------- Mobile 375px ----------
  await viewport(375, 812, true);
  await send("Page.navigate", { url: `${BASE}/` });
  await sleep(5000); // máy dev biên dịch chậm hơn bản build
  await shot("mobile-hero-375.png");

  // Kiểm tra mobile chỉ hiển thị cây lite
  const mobileVisiblePlants = await evaluate(`(() => {
    const plants = Array.from(document.querySelectorAll('#hero-title [data-ink-plant]'));
    const shown = plants.filter(p => getComputedStyle(p).display !== 'none');
    return shown.length === plants.filter(p => p.hasAttribute('data-lite')).length ? shown.length : -1;
  })()`);
  check("Mobile 375px: Chỉ cây có data-lite hiển thị", mobileVisiblePlants > 0, `Số cây hiển thị: ${mobileVisiblePlants}`);

  // Kiểm tra cây không che nút CTA hoặc slogan trên mobile
  const noPlantCoversCta = await evaluate(`(() => {
    const cta = document.querySelector('[data-hero-cta] a');
    if (!cta) return false;
    const r = cta.getBoundingClientRect();
    const t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return cta.contains(t);
  })()`);
  check("Mobile 375px: Nút CTA không bị cây nào che", noPlantCoversCta);

  // ---------- Prefers Reduced Motion ----------
  await send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "reduce" }],
  });
  await send("Page.navigate", { url: `${BASE}/` });
  await sleep(2500); // máy dev hydrate chậm; bản build chỉ cần ~1s
  await shot("reduced-motion.png");

  const reducedMotionOk = await evaluate(`(() => {
    const h = document.querySelector('#hero-title');
    return h && getComputedStyle(h).opacity === '1';
  })()`);
  check("Reduced Motion: Tiêu đề hero hiển thị trọn vẹn", reducedMotionOk);

  check("Console không có lỗi Runtime", consoleErrors.length === 0, consoleErrors.slice(0, 3).join(" | "));
  check("Console không có cảnh báo hydration", consoleWarnings.length === 0, consoleWarnings.slice(0, 3).join(" | "));

} catch (err) {
  check("Smoke test thực thi không lỗi", false, err.message);
} finally {
  ws.close();
  chrome.kill();
  try {
    rmSync(profile, { recursive: true, force: true });
  } catch {}
}

console.log("\n--- KẾT QUẢ INK SMOKE TEST ---");
for (const r of results) {
  console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}${r.detail ? `  (${r.detail})` : ""}`);
}
console.log(`\nẢnh chụp lưu tại: ${path.relative(ROOT, SHOTS)}/`);
const failed = results.filter((r) => !r.ok).length;
console.log(failed ? `\n✗ ${failed} mục FAIL` : `\n✓ TẤT CẢ ĐẠT.`);
process.exit(failed ? 1 : 0);
