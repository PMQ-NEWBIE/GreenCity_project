import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { INK_SOURCES } from "../../src/lobby/ink/sources.ts";
import { INK_HEADINGS, MAX_STEM_WIDTH } from "../../src/lobby/ink/glyphs.generated.ts";
import { INK_PLANTS } from "../../src/lobby/ink/plants.ts";
import { INK_FOLIAGE, INK_SPRITES } from "../../src/lobby/ink/sprites.ts";
import { INK_PEN, INK_WRITE, INK_GROW } from "../../src/lobby/ink/config.ts";
import { SKELETONS, skeletonKey } from "../ink-headings/skeletons.mjs";

test("text trong file sinh ra strictly bằng INK_SOURCES[i].text.normalize('NFC') cho mọi id", () => {
  assert.ok(INK_SOURCES.length >= 9, "hero, features, 3 tính năng, 3 số, cta");
  for (const source of INK_SOURCES) {
    const heading = INK_HEADINGS[source.id];
    assert.ok(heading, `Không tìm thấy heading cho id: ${source.id}`);
    assert.equal(
      heading.text,
      source.text.normalize("NFC"),
      `Text của ${source.id} không khớp dạng NFC`
    );
  }
});

test("ghép words[].text bằng dấu cách ra đúng câu gốc", () => {
  for (const source of INK_SOURCES) {
    const heading = INK_HEADINGS[source.id];
    const joined = heading.words.map((w) => w.text).join(" ");
    assert.equal(
      joined,
      source.text.normalize("NFC"),
      `Ghép từ của ${source.id} không bằng câu gốc`
    );
  }
});

test("mọi mục trong plants.ts tìm được đúng word và char trong glyphs", () => {
  for (const [inkId, plants] of Object.entries(INK_PLANTS)) {
    const heading = INK_HEADINGS[inkId];
    assert.ok(heading, `Heading ${inkId} trong INK_PLANTS không có trong INK_HEADINGS`);

    for (const plant of plants) {
      // Tìm word khớp
      const matchingWords = heading.words.filter((w) => w.text === plant.word);
      assert.ok(
        matchingWords.length > 0,
        `Không tìm thấy word "${plant.word}" trong heading "${inkId}"`
      );

      const targetWord = matchingWords[0];

      // Tìm char trong word (theo Section 5.4: nth là instance thứ nth của char trong word, mặc định 0)
      const matchingGlyphs = targetWord.glyphs.filter((g) => g.char === plant.char);
      assert.ok(
        matchingGlyphs.length > 0,
        `Không tìm thấy char "${plant.char}" trong word "${plant.word}" của heading "${inkId}"`
      );
      const nth = plant.nth ?? 0;
      const matchingChar = matchingGlyphs[nth];
      assert.ok(
        matchingChar,
        `Không tìm thấy glyph thứ ${nth} của char "${plant.char}" trong word "${plant.word}" của heading "${inkId}"`
      );

      // Kiểm tra box của char hợp lệ
      const [x0, y0, x1, y1] = matchingChar.box;
      assert.ok(x1 >= x0, `Box của char "${plant.char}" không hợp lệ: x1 (${x1}) < x0 (${x0})`);
    }
  }
});

test("mọi sprite trong plants.ts có trong INK_SPRITES, file tồn tại và <= maxKB", () => {
  const publicInkDir = path.resolve(process.cwd(), "public/lobby/ink");

  // Kiểm tra tất cả sprite được dùng trong plants.ts
  for (const [inkId, plants] of Object.entries(INK_PLANTS)) {
    for (const plant of plants) {
      assert.ok(
        plant.sprite in INK_SPRITES,
        `Sprite "${plant.sprite}" trong heading "${inkId}" không có trong INK_SPRITES`
      );
    }
  }

  // Kiểm tra tất cả file sprite webp trong INK_SPRITES
  for (const [key, meta] of Object.entries(INK_SPRITES)) {
    const filePath = path.join(publicInkDir, `${key}.webp`);
    assert.ok(fs.existsSync(filePath), `File sprite không tồn tại: ${filePath}`);

    const stat = fs.statSync(filePath);
    const sizeKB = stat.size / 1024;
    assert.ok(
      sizeKB <= meta.maxKB,
      `File sprite "${key}.webp" vượt quá dung lượng: ${sizeKB.toFixed(2)} KB > ${meta.maxKB} KB`
    );
  }

  // Ảnh lá phủ lòng chữ
  for (const [name, meta] of Object.entries(INK_FOLIAGE)) {
    const file = path.join(process.cwd(), "public", meta.src);
    assert.ok(fs.existsSync(file), `Thiếu ảnh lá ${name}: ${meta.src}`);
    const sizeKB = fs.statSync(file).size / 1024;
    assert.ok(sizeKB <= meta.maxKB, `${meta.src} > ${meta.maxKB} KB (${sizeKB.toFixed(1)} KB)`);
  }
});

test("ngòi bút rộng hơn thân chữ đậm nhất, đủ phủ góc vuông ở đầu nét", () => {
  assert.ok(MAX_STEM_WIDTH > 0, `MAX_STEM_WIDTH phải > 0 (hiện tại: ${MAX_STEM_WIDTH})`);
  // Đầu nét đặt ở giữa mép chữ → góc vuông cách tâm ngòi nửa thân chữ; chừa thêm 25 đơn vị mỗi bên
  assert.ok(INK_PEN >= MAX_STEM_WIDTH + 50, `INK_PEN (${INK_PEN}) < ${MAX_STEM_WIDTH + 50}`);
  // Quá rộng thì ngòi lộ sang nét bên cạnh trước khi bút tới (lòng chữ đậm chỉ rộng ~220)
  assert.ok(INK_PEN <= 2 * MAX_STEM_WIDTH, `INK_PEN (${INK_PEN}) quá rộng`);
});

test("mọi chữ trong các tiêu đề có đường nét bút, mỗi từ có nét và đường viền", () => {
  for (const source of INK_SOURCES) {
    for (const ch of source.text.normalize("NFC").replace(/ /g, "")) {
      assert.ok(SKELETONS[skeletonKey(ch)], `Chưa có đường nét bút cho "${ch}" (${source.id}) trong skeletons.mjs`);
    }
    for (const w of INK_HEADINGS[source.id].words) {
      assert.ok(w.outline.startsWith("m"), `${source.id}/${w.text}: thiếu đường viền`);
      assert.ok(w.strokes.length >= w.glyphs.length, `${source.id}/${w.text}: ít nét hơn số chữ`);
      for (const s of w.strokes) assert.ok(/^m-?\d/.test(s.d) && s.len > 0, `${source.id}/${w.text}: nét hỏng "${s.d.slice(0, 20)}"`);
    }
  }
});

test("dấu thanh viết sau thân chữ của cả từ (như viết tay)", () => {
  for (const source of INK_SOURCES) {
    for (const w of INK_HEADINGS[source.id].words) {
      const firstMark = w.strokes.findIndex((s) => s.kind === "mark");
      if (firstMark < 0) continue;
      assert.ok(w.strokes.slice(firstMark).every((s) => s.kind === "mark"), `${source.id}/${w.text}: có thân chữ viết sau dấu`);
    }
  }
});

test("nhịp viết và mọc lá hợp lý", () => {
  const D = INK_WRITE.duration;
  assert.ok(D.hero.full > D.section.full && D.hero.lite < D.hero.full && D.section.lite < D.section.full);
  assert.ok(INK_WRITE.minStroke < INK_WRITE.maxStroke);
  assert.ok(INK_WRITE.lift < INK_WRITE.glyphGap && INK_WRITE.glyphGap < INK_WRITE.wordGap, "nhấc bút < cách chữ < cách từ");
  assert.ok(INK_GROW.liteStep > INK_GROW.step, "điện thoại rải chồi thưa hơn");
  // Chồi lá phải chạm nhau dọc nét, nếu không lá mọc lấm tấm
  assert.ok(INK_GROW.length[0] * 0.5 > INK_GROW.liteStep * 0.6, "chồi quá ngắn so với khoảng cách");
});

test("không file nào trong src/lobby/** chứa Math.random hay opentype", () => {
  const lobbyDir = path.resolve(process.cwd(), "src/lobby");

  function walk(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        walk(fullPath, fileList);
      } else if (/\.(ts|tsx|js|mjs|css)$/.test(file)) {
        fileList.push(fullPath);
      }
    }
    return fileList;
  }

  const lobbyFiles = walk(lobbyDir);
  assert.ok(lobbyFiles.length > 5, "Cần tìm thấy các files trong src/lobby");

  for (const file of lobbyFiles) {
    const content = fs.readFileSync(file, "utf8");
    assert.ok(
      !content.includes("Math.random"),
      `File ${file} chứa Math.random (bị cấm)`
    );
    assert.ok(
      !content.toLowerCase().includes("opentype"),
      `File ${file} chứa opentype (bị cấm trong client bundle)`
    );
  }
});

test("kích thước glyphs.generated.ts <= 70 KB", () => {
  const glyphsPath = path.resolve(process.cwd(), "src/lobby/ink/glyphs.generated.ts");
  const stat = fs.statSync(glyphsPath);
  const sizeKB = stat.size / 1024;
  assert.ok(
    sizeKB <= 70,
    `src/lobby/ink/glyphs.generated.ts vượt quá 70 KB: ${sizeKB.toFixed(2)} KB > 70 KB`
  );
});

test("hero: lá vắt trên nét đứng, hoa trước chữ, mầm ở dấu chấm mọc sau cùng; điện thoại giữ 2–8 cây", () => {
  const hero = INK_PLANTS["hero"];
  const drapes = hero.filter((p) => INK_SPRITES[p.sprite].kind === "drape");
  assert.ok(drapes.length >= 2, "cần ít nhất 2 lá vắt");
  for (const p of hero.filter((p) => INK_SPRITES[p.sprite].kind === "flower")) assert.equal(p.layer, "front");
  const last = hero.at(-1);
  assert.equal(last.sprite, "sprout");
  assert.equal(last.char, ".");
  const lite = hero.filter((p) => p.lite).length;
  assert.ok(lite >= 2 && lite <= 8, `điện thoại nên còn 2–8 cây (đang ${lite})`);
  assert.ok(hero.filter((p) => p.sway).length >= 2, "cần ít nhất 2 lá đung đưa");
});

test("lá vắt: nằm trên đỉnh nét đứng của chữ đỉnh phẳng, trước chữ, đủ to để thấy mà không che hết chữ", () => {
  for (const [id, plants] of Object.entries(INK_PLANTS)) {
    for (const p of plants) {
      if (INK_SPRITES[p.sprite].kind !== "drape") continue;
      const at = `${id}: lá vắt ở ${p.word}/${p.char}`;
      assert.ok("lhbkdĐBTN".includes(p.char), `${at} — chữ không có nét đứng đỉnh phẳng`);
      assert.equal(p.v, 1, `${at} phải nằm đúng đỉnh chữ (v = 1)`);
      assert.equal(p.layer, "front", `${at} phải ở trước chữ`);
      assert.ok(p.size >= 0.5 && p.size <= 0.7, `${at} cỡ ${p.size} ngoài 0.5–0.7em`);
      assert.ok(Math.abs(p.angle) <= 8, `${at} lá rủ theo trọng lực nên gần thẳng đứng`);
    }
  }
});

test("chữ lá: mọi từ vừa trong ảnh lá 3000 đơn vị", () => {
  for (const id of Object.keys(INK_HEADINGS)) {
    for (const w of INK_HEADINGS[id].words) assert.ok(w.width <= 2900, `${id}/${w.text} rộng ${w.width} > 2900`);
  }
});

test("không còn ảnh vẽ bằng code hay tham chiếu ảnh cũ", () => {
  assert.ok(!fs.existsSync("scripts/ink-headings/generate-assets.mjs"), "generate-assets.mjs (vẽ lá bằng SVG) phải bị xóa");
  const src = fs.readdirSync("src/lobby", { recursive: true }).filter((f) => /.(tsx?|css)$/.test(f));
  for (const f of src) {
    const text = fs.readFileSync(path.join("src/lobby", f), "utf8");
    for (const old of ["texture-foliage", "leaf-non", "leaf-duongxi", "leaf-trau-dark", "leaf-xoai-dark", "twig", "flower-muoigio"]) {
      assert.ok(!text.includes(old), `src/lobby/${f} còn tham chiếu "${old}"`);
    }
  }
});

test("cây lớp trước không đặt lên chữ có dấu (che dấu thanh làm đọc sai)", () => {
  const plain = /^[a-zA-ZĐđ.,?]$/;
  for (const [id, plants] of Object.entries(INK_PLANTS)) {
    for (const p of plants) {
      if (p.layer !== "front" || p.v < 0.5) continue;
      assert.ok(plain.test(p.char) && !"ij".includes(p.char), `${id}: cây ở ${p.word}/${p.char} sẽ che dấu`);
    }
  }
});
