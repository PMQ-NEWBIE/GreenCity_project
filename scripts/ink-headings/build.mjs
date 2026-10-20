import { readFileSync, writeFileSync, statSync, mkdirSync } from "node:fs";
import path from "node:path";
import opentype from "opentype.js";
import { INK_SOURCES } from "../../src/lobby/ink/sources.ts";
import { SKELETONS, buildStroke, markCenterline, skeletonKey } from "./skeletons.mjs";

const ROOT = path.resolve(import.meta.dirname, "../..");
const FONT_PATH = path.join(ROOT, "assets-src/fonts/BeVietnamPro-ExtraBold.ttf");
const OUT_PATH = path.join(ROOT, "src/lobby/ink/glyphs.generated.ts");

const buf = readFileSync(FONT_PATH);
const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
const UPM = font.unitsPerEm;
const ASC = font.tables.hhea.ascender;
const DESC = font.tables.hhea.descender; // negative
const XH = font.tables.os2.sxHeight;

// Measure stem width of 'l'
const lGlyph = font.charToGlyph("l");
const lBox = lGlyph.getBoundingBox();
const MAX_STEM_WIDTH = Math.round(lBox.x2 - lBox.x1);

function splitContours(commands) {
  const contours = [];
  let current = [];
  for (const cmd of commands) {
    if (cmd.type === "M" && current.length > 0) {
      contours.push(current);
      current = [];
    }
    current.push(cmd);
    if (cmd.type === "Z") {
      contours.push(current);
      current = [];
    }
  }
  if (current.length > 0) contours.push(current);
  return contours;
}

function getContourBBox(cmds) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const c of cmds) {
    if (c.x !== undefined) { x0 = Math.min(x0, c.x); x1 = Math.max(x1, c.x); }
    if (c.y !== undefined) { y0 = Math.min(y0, c.y); y1 = Math.max(y1, c.y); }
    if (c.x1 !== undefined) { x0 = Math.min(x0, c.x1); x1 = Math.max(x1, c.x1); }
    if (c.y1 !== undefined) { y0 = Math.min(y0, c.y1); y1 = Math.max(y1, c.y1); }
    if (c.x2 !== undefined) { x0 = Math.min(x0, c.x2); x1 = Math.max(x1, c.x2); }
    if (c.y2 !== undefined) { y0 = Math.min(y0, c.y2); y1 = Math.max(y1, c.y2); }
  }
  return [Math.round(x0), Math.round(y0), Math.round(x1), Math.round(y1)];
}

/** Đường viền → dãy điểm dày (để lấy đường giữa của dấu) */
function flattenContour(cmds) {
  const pts = [];
  let cx = 0, cy = 0;
  for (const c of cmds) {
    if (c.type === "M") { cx = c.x; cy = c.y; pts.push([cx, cy]); continue; }
    if (c.type === "Z") continue;
    const k = Math.max(8, Math.ceil(Math.hypot(c.x - cx, c.y - cy) / 10));
    for (let s = 1; s <= k; s++) {
      const t = s / k, m = 1 - t;
      if (c.type === "L") pts.push([cx + (c.x - cx) * t, cy + (c.y - cy) * t]);
      else if (c.type === "Q") pts.push([m * m * cx + 2 * m * t * c.x1 + t * t * c.x, m * m * cy + 2 * m * t * c.y1 + t * t * c.y]);
      else if (c.type === "C")
        pts.push([
          m * m * m * cx + 3 * m * m * t * c.x1 + 3 * m * t * t * c.x2 + t * t * t * c.x,
          m * m * m * cy + 3 * m * m * t * c.y1 + 3 * m * t * t * c.y2 + t * t * t * c.y,
        ]);
    }
    cx = c.x; cy = c.y;
  }
  return pts;
}

function calcContourLengthAndD(cmds) {
  let len = 0;
  let curX = 0, curY = 0;
  let startX = 0, startY = 0;
  let d = "";
  let lastCmd = "";

  for (let ci = 0; ci < cmds.length; ci++) {
    const c = cmds[ci];
    if (c.type === "M") {
      const rx = Math.round(c.x);
      const ry = Math.round(c.y);
      curX = c.x; curY = c.y;
      startX = c.x; startY = c.y;
      d += `M${rx}${ry < 0 ? ry : " " + ry}`;
      lastCmd = "M";
    } else if (c.type === "L") {
      const rx = Math.round(c.x);
      const ry = Math.round(c.y);
      if (rx === Math.round(curX) && ry === Math.round(curY)) continue;
      if (ci === cmds.length - 1 && Math.hypot(c.x - startX, c.y - startY) < 1.5) {
        len += Math.hypot(c.x - curX, c.y - curY);
        curX = startX; curY = startY;
        continue;
      }
      len += Math.hypot(c.x - curX, c.y - curY);
      curX = c.x; curY = c.y;
      const coord = `${rx < 0 ? rx : " " + rx}${ry < 0 ? ry : " " + ry}`;
      if (lastCmd === "L" || lastCmd === "M") {
        d += coord;
        lastCmd = "L";
      } else {
        d += `L${rx}${ry < 0 ? ry : " " + ry}`;
        lastCmd = "L";
      }
    } else if (c.type === "Q") {
      const rx = Math.round(c.x);
      const ry = Math.round(c.y);
      const rx1 = Math.round(c.x1);
      const ry1 = Math.round(c.y1);
      // Sample 12 points
      let prevX = curX, prevY = curY;
      for (let step = 1; step <= 12; step++) {
        const t = step / 12;
        const mt = 1 - t;
        const px = mt * mt * curX + 2 * mt * t * c.x1 + t * t * c.x;
        const py = mt * mt * curY + 2 * mt * t * c.y1 + t * t * c.y;
        len += Math.hypot(px - prevX, py - prevY);
        prevX = px; prevY = py;
      }
      curX = c.x; curY = c.y;
      if (lastCmd === "Q") {
        d += `${rx1 < 0 ? rx1 : " " + rx1}${ry1 < 0 ? ry1 : " " + ry1}${rx < 0 ? rx : " " + rx}${ry < 0 ? ry : " " + ry}`;
      } else {
        d += `Q${rx1}${ry1 < 0 ? ry1 : " " + ry1}${rx < 0 ? rx : " " + rx}${ry < 0 ? ry : " " + ry}`;
        lastCmd = "Q";
      }
    } else if (c.type === "C") {
      const rx = Math.round(c.x);
      const ry = Math.round(c.y);
      const rx1 = Math.round(c.x1);
      const ry1 = Math.round(c.y1);
      const rx2 = Math.round(c.x2);
      const ry2 = Math.round(c.y2);
      let prevX = curX, prevY = curY;
      for (let step = 1; step <= 12; step++) {
        const t = step / 12;
        const mt = 1 - t;
        const px = mt * mt * mt * curX + 3 * mt * mt * t * c.x1 + 3 * mt * t * t * c.x2 + t * t * t * c.x;
        const py = mt * mt * mt * curY + 3 * mt * mt * t * c.y1 + 3 * mt * t * t * c.y2 + t * t * t * c.y;
        len += Math.hypot(px - prevX, py - prevY);
        prevX = px; prevY = py;
      }
      curX = c.x; curY = c.y;
      if (lastCmd === "C") {
        d += `${rx1 < 0 ? rx1 : " " + rx1}${ry1 < 0 ? ry1 : " " + ry1}${rx2 < 0 ? rx2 : " " + rx2}${ry2 < 0 ? ry2 : " " + ry2}${rx < 0 ? rx : " " + rx}${ry < 0 ? ry : " " + ry}`;
      } else {
        d += `C${rx1}${ry1 < 0 ? ry1 : " " + ry1}${rx2 < 0 ? rx2 : " " + rx2}${ry2 < 0 ? ry2 : " " + ry2}${rx < 0 ? rx : " " + rx}${ry < 0 ? ry : " " + ry}`;
        lastCmd = "C";
      }
    } else if (c.type === "Z") {
      len += Math.hypot(startX - curX, startY - curY);
      curX = startX; curY = startY;
      d += "Z";
      lastCmd = "Z";
    }
  }

  if (Math.hypot(startX - curX, startY - curY) > 0.01) {
    len += Math.hypot(startX - curX, startY - curY);
  }
  if (!d.endsWith("Z")) {
    d += "Z";
  }

  return { d, len: Math.round(len) };
}

/** Path tuyệt đối (M L Q C A Z, số nguyên) → tương đối: số ngắn hơn, file nhỏ hơn ~1/3 */
const ARGS = { M: 2, L: 2, Q: 4, C: 6, A: 7, Z: 0 };
function toRelative(d) {
  const tok = d.match(/[MLQCAZ]|-?\d+/g);
  let i = 0;
  let cx = 0, cy = 0, sx = 0, sy = 0;
  let out = "";
  let prev = "";
  const fmt = (nums) => nums.map((n, k) => (k === 0 || n < 0 ? `${k ? "" : ""}${n}` : ` ${n}`)).join("").replace(/^ /, "");
  while (i < tok.length) {
    let op = tok[i];
    if (ARGS[op] === undefined) op = prev === "M" ? "L" : prev; // lặp lệnh ngầm
    else i++;
    const n = ARGS[op];
    const v = tok.slice(i, i + n).map(Number);
    i += n;
    let rel;
    if (op === "Z") { out += "z"; cx = sx; cy = sy; prev = "Z"; continue; }
    if (op === "A") rel = [v[0], v[1], v[2], v[3], v[4], v[5] - cx, v[6] - cy];
    else rel = v.map((n, k) => n - (k % 2 ? cy : cx));
    const lower = op.toLowerCase();
    const same = prev === op && op !== "M";
    const body = fmt(rel);
    out += same ? (rel[0] < 0 ? body : ` ${body}`) : lower + body;
    cx = v[n - 2]; cy = v[n - 1];
    if (op === "M") { sx = cx; sy = cy; }
    prev = op;
  }
  return out;
}

function serializeTS(val) {
  if (val === null || typeof val !== "object") {
    return JSON.stringify(val);
  }
  if (Array.isArray(val)) {
    return `[${val.map(serializeTS).join(",")}]`;
  }
  const parts = [];
  for (const [k, v] of Object.entries(val)) {
    const key = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k) ? k : JSON.stringify(k);
    parts.push(`${key}:${serializeTS(v)}`);
  }
  return `{${parts.join(",")}}`;
}


const headingsData = {};
const statsRows = [];

for (const src of INK_SOURCES) {
  const normText = src.text.normalize("NFC");
  const wordsRaw = normText.split(" ");
  const words = [];
  let totalStrokes = 0;

  for (let wi = 0; wi < wordsRaw.length; wi++) {
    const wordText = wordsRaw[wi];
    const glyphs = font.stringToGlyphs(wordText);
    for (const g of glyphs) {
      if (g.index === 0) {
        throw new Error(`Ký tự '${g.name}' không có trong font BeVietnamPro-ExtraBold`);
      }
    }

    let cursorX = 0;
    const inkGlyphs = [];
    const wordContoursByGlyph = [];

    for (let gi = 0; gi < glyphs.length; gi++) {
      const g = glyphs[gi];
      const next = glyphs[gi + 1];
      const path = g.getPath(cursorX, 0, UPM);

      // Glyphs bounding box
      const gBox = g.getBoundingBox();
      const gBbox = [
        Math.round(cursorX + gBox.x1),
        Math.round(-gBox.y2), // top in SVG (y negative)
        Math.round(cursorX + gBox.x2),
        Math.round(-gBox.y1), // bottom in SVG
      ];
      inkGlyphs.push({ char: wordText[gi], box: gBbox });

      // Đường viền (để tô + cắt lá) và các dấu của glyph này
      const rawContours = splitContours(path.commands);
      const ch = wordText[gi];
      const outlines = [];
      const marks = [];
      for (const rc of rawContours) {
        const bbox = getContourBBox(rc);
        outlines.push(calcContourLengthAndD(rc).d);
        // Dấu: nằm hẳn trên chiều cao chữ thường hoặc hẳn dưới chân chữ
        if (bbox[3] < -0.92 * XH || bbox[1] > 0.02 * UPM) marks.push({ bbox, pts: flattenContour(rc) });
      }
      const key = skeletonKey(ch);
      const skeleton = SKELETONS[key];
      if (!skeleton) throw new Error(`Chưa có đường nét bút cho chữ "${key}" (từ "${wordText}") trong skeletons.mjs`);
      // Dấu mũ viết ngay sau chữ; dấu thanh, chấm chữ i, dấu nặng viết sau cả từ (như viết tay)
      const hasHat = ch.normalize("NFD").includes("̂");
      const above = marks.filter((m) => m.bbox[1] <= 0.02 * UPM);
      const hat = hasHat ? above.reduce((w, m) => (!w || m.bbox[2] - m.bbox[0] > w.bbox[2] - w.bbox[0] ? m : w), null) : null;
      wordContoursByGlyph.push({
        outlines,
        body: [...skeleton.map((src) => ({ src, dx: cursorX })), ...(hat ? [{ src: markCenterline(hat.pts), dx: 0 }] : [])],
        tones: marks
          .filter((m) => m !== hat)
          .sort((m, n) => m.bbox[0] - n.bbox[0])
          .map((m) => ({ src: markCenterline(m.pts), dx: 0 })),
      });

      // Advance cursor
      const kern = next ? font.getKerningValue(g, next) : 0;
      cursorX += g.advanceWidth + src.trackingEm * UPM + kern;
    }

    const wordWidth = Math.round(cursorX);

    // Thứ tự nét: từng chữ trái → phải (thân + dấu mũ), cuối từ mới thêm dấu thanh
    const order = [];
    for (let gi = 0; gi < glyphs.length; gi++) for (const st of wordContoursByGlyph[gi].body) order.push({ ...st, kind: "body", glyph: gi });
    for (let gi = 0; gi < glyphs.length; gi++) for (const st of wordContoursByGlyph[gi].tones) order.push({ ...st, kind: "mark", glyph: gi });

    const strokes = order.map((st) => {
      const { d, len } = buildStroke(st.src, st.dx);
      return { d: toRelative(d), len, kind: st.kind, glyph: st.glyph };
    });
    totalStrokes += strokes.length;
    const outline = toRelative(wordContoursByGlyph.flatMap((g) => g.outlines).join(""));

    const wordData = {
      text: wordText,
      width: wordWidth,
      glyphs: inkGlyphs,
      outline,
      strokes,
    };

    words.push(wordData);
  }

  headingsData[src.id] = {
    id: src.id,
    text: normText,
    upm: UPM,
    ascender: ASC,
    descender: DESC,
    words,
  };

  statsRows.push({
    id: src.id,
    words: words.length,
    strokes: totalStrokes,
    maxStemWidth: MAX_STEM_WIDTH,
  });
}

mkdirSync(path.dirname(OUT_PATH), { recursive: true });

const code = `// FILE TỰ SINH, KHÔNG SỬA TAY, chạy \`npm run ink:build\`
import type { InkHeadingData } from "./types";
import type { InkId } from "./sources";

export const MAX_STEM_WIDTH = ${MAX_STEM_WIDTH};
export const UPM = ${UPM};
export const ASCENDER = ${ASC};
export const DESCENDER = ${DESC};

export const INK_HEADINGS: Record<InkId, InkHeadingData> = ${serializeTS(headingsData)};
`;

writeFileSync(OUT_PATH, code, "utf-8");
const outStats = statSync(OUT_PATH);
const sizeKB = (outStats.size / 1024).toFixed(1);

for (const row of statsRows) {
  row.fileSizeKB = sizeKB;
}

console.log("\n--- BẢNG THỐNG KÊ INK HEADINGS ---");
console.table(statsRows);
console.log(`Xuất thành công: ${path.relative(ROOT, OUT_PATH)} (${sizeKB} KB / tối đa 70 KB)`);
if (outStats.size > 70 * 1024) {
  console.error(`LỖI: File sinh ra vượt quá 70 KB (${sizeKB} KB)`);
  process.exit(1);
}
