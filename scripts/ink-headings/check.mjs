/**
 * KIỂM TRA NÉT BÚT PHỦ KÍN CHỮ
 *
 *   npm run ink:check
 *
 * Với mỗi tiêu đề: tô thân chữ đỏ, rồi tô xanh phần ngòi bút (rộng INK_PEN) đi qua, vẽ đường tâm nét đen.
 * Còn đỏ = chỗ nét bút không chạm tới → chữ sẽ bị khuyết khi viết. Ảnh ra assets-src/ink/_check/skeleton-<id>.png.
 * Thoát lỗi nếu một từ phủ dưới MIN_COVER.
 */
import { mkdirSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { INK_HEADINGS } from "../../src/lobby/ink/glyphs.generated.ts";
import { INK_PEN } from "../../src/lobby/ink/config.ts";

const ROOT = path.resolve(import.meta.dirname, "../..");
const OUT = path.join(ROOT, "assets-src/ink/_check");
mkdirSync(OUT, { recursive: true });

const SCALE = 0.12; // px / đơn vị font
const MIN_COVER = 0.995;

async function whiteCount(svg) {
  const { data, info } = await sharp(Buffer.from(svg)).raw().toBuffer({ resolveWithObject: true });
  let n = 0;
  for (let i = 0; i < data.length; i += info.channels) if (data[i] > 127) n++;
  return n;
}

let failed = false;
for (const [id, h] of Object.entries(INK_HEADINGS)) {
  const pen = INK_PEN;
  const H = h.ascender - h.descender;
  const pad = 200;
  const rows = [];
  let y = 0;
  for (const [wi, w] of h.words.entries()) {
    const W = w.width + 2 * pad;
    const vb = `${-pad} ${-h.ascender - pad} ${W} ${H + 2 * pad}`;
    const size = `width="${Math.round(W * SCALE)}" height="${Math.round((H + 2 * pad) * SCALE)}"`;
    const strokes = w.strokes.map((s) => `<path d="${s.d}"/>`).join("");
    const maskDef = `<mask id="m${wi}" maskUnits="userSpaceOnUse" x="${-pad}" y="${-h.ascender - pad}" width="${W}" height="${H + 2 * pad}"><g fill="none" stroke="#fff" stroke-width="${pen}" stroke-linecap="round" stroke-linejoin="round">${strokes}</g></mask>`;
    const all = await whiteCount(`<svg xmlns="http://www.w3.org/2000/svg" ${size} viewBox="${vb}"><rect x="-9999" y="-9999" width="99999" height="99999"/><path d="${w.outline}" fill="#fff"/></svg>`);
    const hit = await whiteCount(
      `<svg xmlns="http://www.w3.org/2000/svg" ${size} viewBox="${vb}"><defs>${maskDef}</defs><rect x="-9999" y="-9999" width="99999" height="99999"/><path d="${w.outline}" fill="#fff" mask="url(#m${wi})"/></svg>`
    );
    const cover = hit / Math.max(1, all);
    if (cover < MIN_COVER) failed = true;
    console.log(`${id.padEnd(10)} ${w.text.padEnd(8)} phủ ${(cover * 100).toFixed(2)}%${cover < MIN_COVER ? "  ← THIẾU" : ""}`);
    rows.push({
      svg: `<svg x="0" y="${y}" ${size} viewBox="${vb}"><defs>${maskDef}</defs><rect x="-9999" y="-9999" width="99999" height="99999" fill="#fff"/><path d="${w.outline}" fill="#e11"/><path d="${w.outline}" fill="#9c9" mask="url(#m${wi})"/><g fill="none" stroke="#123" stroke-width="10">${strokes}</g><text x="${-pad + 10}" y="${-h.ascender - pad + 90}" font-size="80">${wi}</text></svg>`,
      h: Math.round((H + 2 * pad) * SCALE),
      w: Math.round(W * SCALE),
    });
    y += rows.at(-1).h;
  }
  const width = Math.max(...rows.map((r) => r.w));
  const sheet = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${y}">${rows.map((r) => r.svg).join("")}</svg>`;
  await sharp(Buffer.from(sheet)).png().toFile(path.join(OUT, `skeleton-${id}.png`));
}
if (failed) {
  console.error(`\nCó từ phủ dưới ${MIN_COVER * 100}% — sửa đường nét trong scripts/ink-headings/skeletons.mjs`);
  process.exit(1);
}
