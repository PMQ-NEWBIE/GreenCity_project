# Prompt cho Gemini 3.8 Flash (Antigravity): tiêu đề "viết tay rồi nở lá"

> Cách dùng: mở dự án `C:\123` trong Antigravity, chọn Gemini 3.8 Flash, dán **toàn bộ** phần từ "BẮT ĐẦU PROMPT" tới "KẾT THÚC PROMPT". Gửi kèm ảnh mẫu chữ lá cây (ảnh chữ M N O P làm từ lá).

---

## BẮT ĐẦU PROMPT

# 1. VAI TRÒ VÀ MỤC TIÊU

Bạn là **motion designer kiêm frontend developer**. Dự án này là **Green City** (Next.js 16, React 19, Tailwind 4, GSAP 3.15), một trang web giúp người dân TP.HCM bán ve chai và đồ cũ.

Bạn làm **một việc duy nhất**: đổi cách 6 tiêu đề trên trang lobby (`/`) xuất hiện.

**Ý tưởng (đọc kỹ, đây là thứ người dùng muốn thấy):**
1. Chữ tiêu đề **hiện ra như có người đang cầm bút viết**: từng nét một, theo đường đi của nét chữ. Không phải hiện mờ dần, không phải quét từ trái sang phải.
2. Viết xong, **lá cây và hoa bắt đầu nở ra từ chính các con chữ**. Một ít lá và hoa **lấn ra ngoài viền chữ**, giống ảnh mẫu (chữ M N O P làm từ lá, có lá thò ra ngoài mép chữ).
3. Cả 6 tiêu đề **cùng một họ** (viết tay → cây mọc) nhưng **mỗi loại tiêu đề khác nhau rõ ràng**. Không được giống y nhau, cũng không được khác hẳn nhau. Mục 6 quy định chính xác chỗ khác nhau.

Phải làm **trọn vẹn tới khi mọi mục ở phần 11 (ĐỊNH NGHĨA HOÀN THÀNH) đạt**. Không để TODO. Không báo xong khi còn mục chưa đạt. Không hỏi lại giữa chừng, trừ các trường hợp ở phần 12.

# 2. ĐỌC TRƯỚC KHI LÀM (bắt buộc, theo đúng thứ tự)

1. `AGENTS.md`: bản Next.js này khác bản bạn đã học. Nếu bạn cần đụng tới server/client component, đọc hướng dẫn tương ứng trong `node_modules/next/dist/docs/`.
2. `src/lobby/LobbyPage.tsx`: nơi gọi mọi animation (`useGSAP` + `gsap.matchMedia`).
3. `src/lobby/animations/intro.ts`: intro hero. Tiêu đề hiện đang tách ký tự bằng `SplitText` (thuộc tính `data-split-title`).
4. `src/lobby/animations/sections.ts`: hàm `revealFeatures` làm hiện phần tính năng khi cuộn tới.
5. `src/lobby/config.ts`: mọi thông số animation đều nằm ở đây. Code mới cũng phải theo kiểu này.
6. `src/lobby/sections/LobbyHero.tsx`, `LobbyFeatures.tsx`, `LobbyCta.tsx`: 6 tiêu đề nằm ở đây.
7. `src/lobby/lobby.css`: cơ chế chống nháy `.js .lobby:not(.is-ready) [data-intro]`.
8. `scripts/lobby-assets/process.mjs`: hàm `keyOutBackground` tách nền magenta. Bạn sẽ **sao chép** hàm này, không import và không sửa file gốc.

# 3. SÁU TIÊU ĐỀ VÀ BIẾN THỂ CỦA CHÚNG

| id | Câu chữ (giữ nguyên từng dấu) | Thẻ | File | Màu chữ | letter-spacing | Biến thể |
|---|---|---|---|---|---|---|
| `hero` | Đồ cũ nhà bạn chưa phải là rác. | h1 | LobbyHero.tsx | `text-gc-900` | -0.03em | `hero` |
| `features` | Ba việc bạn làm được ngay hôm nay | h2 | LobbyFeatures.tsx | `text-gc-900` | -0.02em | `vine` |
| `feature-1` | Bán đồ cũ trong một phút | h3 | LobbyFeatures.tsx | `text-gc-900` | -0.01em | `sprout` |
| `feature-2` | Tìm đúng loại, đúng khu | h3 | LobbyFeatures.tsx | `text-gc-900` | -0.01em | `sprout` |
| `feature-3` | Gọi người tới tận nhà | h3 | LobbyFeatures.tsx | `text-gc-900` | -0.01em | `sprout` |
| `cta` | Nhà bạn đang có gì cần dọn? | h2 | LobbyCta.tsx | `text-white` | -0.02em | `chalk` |

Font của cả 6 tiêu đề: **Be Vietnam Pro, weight 800 (ExtraBold)**. Giữ nguyên mọi class cỡ chữ, line-height, max-width hiện có của từng thẻ.

# 4. LUẬT CỨNG

## Được tạo hoặc sửa
- Tạo mới: `src/lobby/ink/**`, `src/lobby/animations/ink.ts`, `scripts/ink-headings/**`, `scripts/tests/ink-headings.test.mjs`, `assets-src/fonts/**`, `assets-src/ink/**`, `public/lobby/ink/**`.
- Sửa: `LobbyHero.tsx`, `LobbyFeatures.tsx`, `LobbyCta.tsx` (chỉ phần tiêu đề và con số 01/02/03), `intro.ts` (chỉ phần tiêu đề, slogan, finale), `sections.ts` (chỉ `revealFeatures` và hàm mới), `LobbyPage.tsx` (chỉ gọi hàm mới và dọn `SplitText` nếu hết dùng), `config.ts` (chỉ khối `intro`, nếu cần), `lobby.css` (chỉ thêm quy tắc mới có tiền tố `.lobby-ink`).
- `package.json`: chỉ thêm devDependency `opentype.js` và 2 script `ink:build`, `ink:sprites`.

## Cấm (vi phạm một mục là thất bại)
- **Không** dùng thẻ SVG `<text>`, `-webkit-text-stroke`, canvas, WebGL, Lottie, video hay GIF để làm hiệu ứng viết.
- **Không** dùng font viết tay hay font script. Chữ cuối cùng phải **giống hệt** chữ Be Vietnam Pro 800 hiện tại.
- **Không** giả hiệu ứng viết bằng `clip-path` hay mask quét ngang từ trái sang phải. Phải đi theo đường viền từng nét chữ (mục 5.3).
- **Không** dùng `DrawSVGPlugin` cho các path nằm trong `<mask>`. Dùng `pathLength="1"` + `stroke-dashoffset` (mục 5.3).
- **Không** đặt lá hay hoa bằng `div` định vị tuyệt đối đè lên tiêu đề. Lá phải nằm **trong SVG của từng từ**, dùng chung hệ tọa độ với chữ (mục 5.4).
- **Không** dùng `Math.random()` ở bất cứ đâu trong component, vì sẽ lệch HTML server/client (hydration mismatch). Mọi vị trí đều cố định trong file cấu hình.
- **Không** dùng framer-motion cho việc này. Chỉ dùng GSAP, đã có sẵn.
- **Không** import `opentype.js` từ code chạy trên trình duyệt. Nó chỉ chạy trong script build.
- **Không** đổi câu chữ, không đổi thứ tự hay z-index các lớp hero, không xóa thuộc tính `data-*` nào đang có (trừ `data-split-title` mà mục 7.1 cho phép thay).
- **Không** dùng ảnh tải từ Internet hay ảnh stock cho lá và hoa. Ảnh phải tạo bằng công cụ tạo ảnh của bạn (mục 8).
- **Không commit.** Phần này nằm ngoài vùng file của Gemini trong `scripts/collab/areas.mjs`. Người dùng sẽ tự commit. Không chạy `git add -A`, `git stash`, `git reset`, `git clean`.

# 5. KIẾN TRÚC KỸ THUẬT (làm đúng y như sau)

## 5.1 Ý tưởng tổng thể

```
assets-src/fonts/BeVietnamPro-ExtraBold.ttf
        │  (scripts/ink-headings/build.mjs, dùng opentype.js, chạy lúc build)
        ▼
src/lobby/ink/glyphs.generated.ts   ← đường viền (path) từng nét của từng chữ, đơn vị font
        │
        ▼
<InkHeading> (server component)     ← mỗi TỪ là một <svg> inline-block, xuống dòng tự nhiên như chữ
        │                              + chữ thật ẩn (sr-only) cho trình đọc màn hình và SEO
        ▼
src/lobby/animations/ink.ts         ← GSAP: viết từng nét (mask), rồi lá/hoa nở
```

**Vì sao mỗi từ là một SVG riêng:** tiêu đề đổi cỡ theo `clamp()` và tự xuống dòng khác nhau trên điện thoại và máy tính. Mỗi từ là một `<svg>` `inline-block` có chiều rộng tính bằng `em` nên trình duyệt tự xuống dòng tại dấu cách. Lá và hoa nằm trong SVG của từ, nên luôn bám đúng chữ dù xuống dòng kiểu gì.

## 5.2 Bước A: chuyển chữ thành path (script build)

**Font:** tải `BeVietnamPro-ExtraBold.ttf` từ
`https://github.com/google/fonts/raw/main/ofl/bevietnampro/BeVietnamPro-ExtraBold.ttf`
và lưu vào `assets-src/fonts/BeVietnamPro-ExtraBold.ttf`. Font này cấp phép OFL nên được dùng. Nếu link hỏng, xem phần 12.

**`src/lobby/ink/sources.ts`** (nguồn câu chữ duy nhất):
```ts
export const INK_SOURCES = [
  { id: "hero", text: "Đồ cũ nhà bạn chưa phải là rác.", trackingEm: -0.03, vine: false },
  { id: "features", text: "Ba việc bạn làm được ngay hôm nay", trackingEm: -0.02, vine: true },
  { id: "feature-1", text: "Bán đồ cũ trong một phút", trackingEm: -0.01, vine: false },
  { id: "feature-2", text: "Tìm đúng loại, đúng khu", trackingEm: -0.01, vine: false },
  { id: "feature-3", text: "Gọi người tới tận nhà", trackingEm: -0.01, vine: false },
  { id: "cta", text: "Nhà bạn đang có gì cần dọn?", trackingEm: -0.02, vine: false },
] as const;
export type InkId = (typeof INK_SOURCES)[number]["id"];
```

**`scripts/ink-headings/build.mjs`** phải làm đúng các bước sau:

1. Đọc font:
   ```js
   const buf = readFileSync(FONT);
   const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
   const UPM = font.unitsPerEm;
   const ASC = font.tables.hhea.ascender;
   const DESC = font.tables.hhea.descender; // số âm
   const XH = font.tables.os2.sxHeight;
   ```
2. Với mỗi câu: `text.normalize("NFC")`, rồi tách từ theo dấu cách.
3. Với mỗi từ: `const glyphs = font.stringToGlyphs(word)`. **Nếu có glyph nào `index === 0` (ký tự không có trong font) thì `throw` và dừng ngay**, kèm tên ký tự.
4. Đặt từng glyph với con trỏ `x` bắt đầu từ 0 và baseline `y = 0`:
   - `const path = glyph.getPath(x, 0, UPM)`. Với fontSize = UPM, tọa độ trả về là đơn vị font, trục y hướng xuống (giống SVG), phần chữ nằm trên baseline có y âm.
   - `x += glyph.advanceWidth + trackingEm * UPM + (next ? font.getKerningValue(glyph, next) : 0)`.
   - Chiều rộng từ = `x` cuối cùng. Phần tracking của ký tự cuối được giữ lại, vì CSS `letter-spacing` cũng cộng sau mọi ký tự.
5. **Tách contour:** duyệt `path.commands`. Mỗi lệnh `M` bắt đầu một contour mới, `Z` kết thúc contour. Mỗi contour thành một chuỗi `d` riêng, **làm tròn tọa độ thành số nguyên**.
6. **Phân loại contour** bằng bounding box `[x0, y0 (trên), x1, y1 (dưới)]` tính từ mọi điểm, kể cả điểm điều khiển:
   - `mark` (dấu thanh, dấu mũ, chấm chữ i, dấu nặng) nếu `y1 < -0.92 * XH` (nằm hẳn trên đường x-height) **hoặc** `y0 > 0.02 * UPM` (nằm hẳn dưới baseline).
   - Còn lại là `body`.
7. **Thứ tự nét trong một từ** (đây là thứ tạo cảm giác người viết):
   - Đi lần lượt từng glyph từ trái sang phải. Trong mỗi glyph, vẽ các contour `body`, contour có diện tích bbox lớn nhất trước (thân chữ trước, lỗ trong như lòng chữ o sau).
   - **Mọi contour `mark` của cả từ được vẽ SAU CÙNG**, từ trái sang phải. Người Việt viết xong chữ rồi mới bỏ dấu.
8. **Độ dài gần đúng** của mỗi contour (dùng để tính thời gian vẽ): `L` lấy khoảng cách thẳng; `Q` và `C` lấy mẫu 12 điểm trên đường cong rồi cộng các đoạn; `Z` cộng đoạn quay về điểm đầu. Làm tròn số nguyên.
9. Với câu có `vine: true`, tạo thêm cho mỗi từ một **dây leo**: polyline lấy mẫu mỗi 40 đơn vị, từ `x = -40` tới `x = width + spaceAdvance` (riêng từ cuối là `width + 300`), `y = 130 + 34 * sin(2π · x / 640)`. Xuất `d`, `len` và `nodes` (điểm mọc lá): bắt đầu ở x = 200, cách nhau mỗi 520 đơn vị, `side` luân phiên 1 và -1, kèm `t = vị trí / tổng độ dài` (0 → 1).
10. Ghi `src/lobby/ink/glyphs.generated.ts`, có comment đầu file "FILE TỰ SINH, KHÔNG SỬA TAY, chạy `npm run ink:build`". Kiểu dữ liệu đặt trong `src/lobby/ink/types.ts`:
    ```ts
    export interface InkStroke { d: string; len: number; kind: "body" | "mark"; glyph: number }
    export interface InkGlyph { char: string; box: [number, number, number, number] } // x0, y0(trên), x1, y1(dưới)
    export interface InkVine { d: string; len: number; nodes: { x: number; y: number; side: 1 | -1; t: number }[] }
    export interface InkWord { text: string; width: number; glyphs: InkGlyph[]; strokes: InkStroke[]; vine?: InkVine }
    export interface InkHeadingData { id: string; text: string; upm: number; ascender: number; descender: number; words: InkWord[] }
    ```
    **Không** xuất riêng path tô (fill). Path tô của từ = nối mọi `strokes[].d` lại. Làm vậy để file nhẹ đi một nửa. Giới hạn: file sinh ra ≤ 70 KB.
11. Script in ra bảng: id, số từ, số nét, độ rộng nét đứng lớn nhất (đo bằng bbox của glyph `l`), dung lượng file.

Thêm vào `package.json`:
```json
"ink:build": "node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/ink-headings/build.mjs",
"ink:sprites": "node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/ink-headings/sprites.mjs"
```

## 5.3 Bước B: component `<InkHeading>` và kỹ thuật "viết"

**File:** `src/lobby/ink/InkHeading.tsx`. **Không** có `"use client"`. Component chỉ dựng SVG tĩnh, không dùng hook. GSAP lo phần chuyển động qua thuộc tính `data-*`, giống cách cả lobby đang làm.

**Props:** `as: "h1" | "h2" | "h3"`, `inkId: InkId`, `variant: "hero" | "vine" | "sprout" | "chalk"`, cộng mọi prop còn lại của thẻ heading (`id`, `className`, `data-intro`...).

**Cấu trúc HTML:**
```tsx
<Tag {...rest} data-ink={inkId} data-ink-variant={variant} className={cn("relative", className)}>
  <span className="sr-only">{h.text}</span>
  <span aria-hidden="true">
    {h.words.map((w, wi) => (
      <Fragment key={wi}>
        {wi > 0 && " "}
        <InkWord ... />
      </Fragment>
    ))}
  </span>
  {process.env.NEXT_PUBLIC_INK_DEBUG === "1" && (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0 text-red-600/40">{h.text}</span>
  )}
</Tag>
```
Dấu cách `" "` giữa các SVG là ký tự thật, nên có đúng độ rộng của font và tự có letter-spacing. Lớp debug đỏ dùng để kiểm tra chữ SVG có trùng khít với chữ thật không (mục 10, bước 2).

**Kích thước SVG của mỗi từ** (bắt buộc đúng công thức, nếu không chữ sẽ lệch dòng):
```tsx
const H = asc - desc;                    // desc là số âm
<svg
  data-ink-word={wi}
  viewBox={`0 ${-asc} ${w.width} ${H}`}
  style={{
    display: "inline-block",
    overflow: "visible",                 // để lá thò ra ngoài chữ
    width: `${w.width / upm}em`,
    height: `${H / upm}em`,
    verticalAlign: `${desc / upm}em`,    // baseline của glyph trùng baseline dòng chữ
    marginTop: `${-H / upm}em`,          // hộp margin cao 0, nên dòng chữ giữ đúng line-height cũ
  }}
>
```

**Kỹ thuật viết: mask + nét bút dày chạy dọc đường viền**

Chữ đậm là hình tô kín, không có "nét giữa" để vẽ. Cách làm: tô chữ đặc bình thường, nhưng che bằng một `<mask>`. Bên trong mask là chính các contour của chữ, vẽ bằng **nét trắng rất dày** (`PEN`), đầu nét tròn. Khi các nét trong mask "chạy" dọc theo viền chữ, phần chữ đặc lộ ra dần theo đường bút, giống mực đang loang theo ngòi bút.

```tsx
const maskId = `ink-${inkId}-w${wi}`;       // id cố định, KHÔNG dùng useId hay random
const allD = w.strokes.map((s) => s.d).join(" ");
<defs>
  <mask id={maskId} maskUnits="userSpaceOnUse" x={-upm} y={-asc - upm} width={w.width + 2 * upm} height={H + 2 * upm}>
    <g fill="none" stroke="#fff" strokeWidth={INK_PEN[variant]} strokeLinecap="round" strokeLinejoin="round">
      {w.strokes.map((s, i) => (
        <path key={i} d={s.d} pathLength={1} data-ink-stroke data-kind={s.kind} data-len={s.len} data-glyph={s.glyph} />
      ))}
    </g>
  </mask>
</defs>
<g data-ink-back>{/* dây leo + lá/hoa lớp SAU chữ */}</g>
<g data-ink-fill mask={`url(#${maskId})`}>
  <path d={allD} fill="currentColor" fillRule="nonzero" />
</g>
{/* chỉ biến thể hero: <g data-ink-texture> phủ ảnh lá vào trong chữ (mục 5.5) */}
<g data-ink-front>{/* lá/hoa lớp TRƯỚC chữ */}</g>
```

- `fill="currentColor"` nên chữ tự lấy màu `text-gc-900` hay `text-white` của thẻ heading.
- **HTML server render ra là trạng thái CUỐI** (nét mask vẽ đủ, lá đủ, ảnh lá hiện đủ). JavaScript mới đặt trạng thái ẩn ban đầu. Vì vậy khi tắt JS hoặc bật "giảm chuyển động", người dùng vẫn thấy tiêu đề hoàn chỉnh.
- **`PEN` phải ≥ 1.8 × độ rộng nét đứng lớn nhất** (script in ra ở bước 11). Nếu nhỏ hơn, ở trạng thái cuối sẽ còn lỗ hổng trong lòng chữ. Khởi điểm: 300 đơn vị font. Kiểm tra bằng mắt ở mục 10.
- **Cách tween một nét**, với `pathLength="1"`:
  - Trạng thái đầu: `strokeDasharray: "1 1"`, `strokeDashoffset: 1`, `opacity: 0`.
  - Ngay lúc nét bắt đầu: `set(opacity: 1)`, rồi tween `strokeDashoffset: 1 → 0`.
  - `opacity: 0` lúc đầu để tránh đầu nét tròn để lại một chấm khi nét còn dài 0.

## 5.4 Bước C: lá, hoa, mầm, cành

**Ảnh:** WebP nền trong suốt, khung vuông 384×384, nằm trong `public/lobby/ink/` (mục 8). Có 2 kiểu điểm neo (`pivot`):
- `base`: lá, mầm, cành. Cuống nằm **chính giữa mép dưới** ảnh, đầu lá hướng **thẳng lên**. Góc 0° nghĩa là mọc thẳng lên.
- `center`: hoa. Nhụy nằm giữa ảnh.

**`src/lobby/ink/sprites.ts`:**
```ts
export const INK_SPRITES = {
  "leaf-trau":      { src: "/lobby/ink/leaf-trau.webp",      kind: "leaf",   pivot: "base",   maxKB: 30 },
  // ... đủ các key ở mục 8
} as const;
```

**`src/lobby/ink/plants.ts`:** danh sách cây của từng tiêu đề. Mỗi mục có dạng:
```ts
{ word: "phải", char: "p", nth?: 0, u: 0.2, v: 0, angle: 196, size: 0.36, sprite: "leaf-xoai", layer: "back", lite?: true, sway?: true }
```
- `word`, `char`: tìm từ có `text === word`, rồi lấy glyph thứ `nth` (mặc định 0) có `char === char`.
- `u`, `v`: vị trí trong bbox của glyph đó. `u = 0` là mép trái, `1` là mép phải. `v = 0` là đáy, `1` là đỉnh (bbox đã tính cả dấu).
- `angle`: độ, quay theo chiều kim đồng hồ, 0° là thẳng lên.
- `size`: cạnh của ảnh, tính bằng em (× upm ra đơn vị font).
- `layer`: `back` vẽ sau chữ (bị chữ che một phần), `front` vẽ trước chữ.
- `lite`: vẫn hiện trên điện thoại. Cây không có `lite` bị ẩn khi màn hình < 768px.
- `sway`: lá đung đưa nhẹ sau khi mọc xong (chỉ hero, chỉ máy tính).
- Thứ tự trong mảng chính là thứ tự mọc.

**Cách dựng một cây trong SVG.** Bọc 2 lớp: lớp ngoài đặt vị trí và góc, lớp trong để GSAP animate quanh gốc (0,0):
```tsx
const [x0, y0, x1, y1] = glyph.box;
const ax = x0 + p.u * (x1 - x0);
const ay = y1 - p.v * (y1 - y0);
const s = p.size * upm;
<g transform={`translate(${ax} ${ay}) rotate(${p.angle})`}>
  <g data-ink-plant data-kind={sprite.kind} data-order={i} data-lite={p.lite ? "" : undefined} data-sway={p.sway ? "" : undefined}>
    <image href={sprite.src} x={-s / 2} y={sprite.pivot === "center" ? -s / 2 : -s} width={s} height={s} />
  </g>
</g>
```
Thêm vào `lobby.css`:
```css
@media (max-width: 767.98px) {
  .lobby [data-ink-plant]:not([data-lite]) { display: none; }
}
```

**Luật đặt cây để không đè lên dòng chữ khác:** chỉ cho lá thò ra **phía trên** từ đỉnh chữ cao (chữ hoa, h, b, l, đ, dấu) và **phía dưới** từ phần đuôi chữ (p, g, y). Không cho lá thò ngang dài quá 0.35em sang từ bên cạnh. Lá lớp `front` chỉ được che tối đa khoảng 1/4 diện tích một con chữ.

## 5.5 Ảnh lá phủ trong chữ (CHỈ biến thể `hero`)

Sau khi viết xong, chữ hero "thấm" thành chữ làm từ lá, giống ảnh mẫu. Trong SVG của mỗi từ hero, thêm:
```tsx
<defs>
  <clipPath id={`${maskId}-clip`}><path d={allD} /></clipPath>
  <pattern id={`${maskId}-tex`} patternUnits="userSpaceOnUse" width={1400} height={1400}
           patternTransform={`translate(${-wi * 337} 0)`}>
    <image href="/lobby/ink/texture-foliage-dark.webp" width={1400} height={1400} />
  </pattern>
</defs>
<g data-ink-texture clipPath={`url(#${maskId}-clip)`}>
  <rect x={0} y={-asc} width={w.width} height={H} fill={`url(#${maskId}-tex)`} />
</g>
```
Pattern dùng `userSpaceOnUse` cỡ 1.4em, nên lá trong mọi từ có **cùng tỉ lệ**, không bị phóng to ở từ ngắn. `translate` khác nhau cho mỗi từ để các từ không lặp cùng một mảng lá. Ảnh tối (`-dark`) giữ chữ đủ tương phản với nền trời sáng (mục 8.3).

# 6. BỐN BIẾN THỂ: CÙNG HỌ, KHÁC NHAU RÕ

| | `hero` (h1) | `vine` (h2 tính năng) | `sprout` (3 × h3) | `chalk` (h2 CTA, chữ trắng) |
|---|---|---|---|---|
| **Đơn vị viết** | từng **nét** một, nối tiếp | từng **từ** (mọi nét của một từ chạy cùng lúc) | từng **chữ cái** (nét của một chữ cùng lúc, dấu chậm hơn một nhịp) | từng **nét**, nhanh và dứt khoát |
| **Tốc độ** | chậm, như viết nắn nót (1.8s, điện thoại 1.2s) | nhanh, đều | rất nhanh (~0.9s) | nhanh (1.2s, điện thoại 0.9s) |
| **Bút (`PEN`)** | 300 | 340 (vệt to, loang mạnh) | 300 | 260 (mảnh, gọn) |
| **Lòng chữ** | mực đặc → **thấm thành ảnh lá** | mực đặc, giữ nguyên | mực đặc, giữ nguyên | **trắng** đặc, giữ nguyên |
| **Cây** | **chùm** 11 lá + hoa + mầm, cả trước và sau chữ, **mọc ra từ chữ** | **dây leo** bò dọc dưới chân chữ, lá nhỏ bật ra dọc dây, cuối dây nở 1 hoa | **1 cây "chữ ký" riêng** cho mỗi h3 (mầm / hoa / cành), kèm số 01/02/03 làm bằng lá | lá tối màu **trồi lên từ sau lưng chữ**, cuối cùng 1 hoa nở ngay chấm dấu "?" |
| **Chuyển động cây** | xoay + phóng từ gốc, nảy nhẹ | bật nhanh theo đầu dây leo đi qua | mỗi loại cây một kiểu (mục 6.3) | trượt lên dọc thân lá + hiện dần |
| **Khi nào chạy** | intro lúc tải trang | khi cuộn tới (`top 80%`), một lần | cùng lúc khối tính năng hiện ra | khi cuộn tới (`top 75%`), một lần |
| **Sau khi xong** | 3 lá đung đưa rất nhẹ (máy tính) | đứng yên | đứng yên | đứng yên |

**Thông số** ghi vào `src/lobby/ink/config.ts` (đơn vị: giây và đơn vị font). Không được rải số trong code.
```ts
export const INK_PEN = { hero: 300, vine: 340, sprout: 300, chalk: 260 } as const;

export const INK_MOTION = {
  hero: {
    unit: "stroke", speed: 5200, minStroke: 0.05, maxStroke: 0.22, overlap: 0.7, glyphGap: 0.015, wordGap: 0.06,
    strokeEase: "power1.inOut", writeDuration: { full: 1.8, lite: 1.2 },
    texture: { duration: 0.9, ease: "power1.inOut" },
    plants: { startAt: 0.7, stagger: 0.09, accentDelay: 0.25 },
    sway: { deg: 3, duration: [2.4, 3.2] },
  },
  vine: {
    unit: "word", wordDur: 0.38, wordStagger: 0.14, strokeEase: "power2.out",
    vineStroke: 22, vineDurScale: 1.6, leafPop: { duration: 0.32, ease: "back.out(3)" }, trigger: "top 80%",
  },
  sprout: {
    unit: "glyph", glyphDur: 0.16, glyphStagger: 0.05, markDelay: 0.06, strokeEase: "power2.out",
    number: { duration: 0.6, ease: "power2.out" }, plantDelay: 0.05,
  },
  chalk: {
    unit: "stroke", speed: 9000, minStroke: 0.03, maxStroke: 0.14, overlap: 0.6, glyphGap: 0, wordGap: 0.04,
    strokeEase: "power2.out", writeDuration: { full: 1.2, lite: 0.9 },
    rise: { fromY: 0.22, fromScale: 0.7, duration: 0.9, ease: "power3.out", stagger: 0.1 }, trigger: "top 75%",
  },
} as const;
```

## 6.1 `hero`: chùm lá và hoa (giống ảnh mẫu nhất)

Các từ: `Đồ` `cũ` `nhà` `bạn` `chưa` `phải` `là` `rác.`

| # | word | char | u | v | angle | size | sprite | layer | lite | sway |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Đồ | Đ | 0.12 | 1 | -38 | 0.46 | leaf-xoai | front | ✓ | ✓ |
| 2 | Đồ | ồ | 1 | 0.55 | 64 | 0.26 | leaf-non | back | | |
| 3 | nhà | h | 0.2 | 1 | 12 | 0.44 | leaf-trau | back | ✓ | |
| 4 | bạn | b | 0.18 | 1 | -16 | 0.30 | leaf-duongxi | front | | ✓ |
| 5 | chưa | ư | 0.95 | 0.95 | 48 | 0.22 | leaf-non | front | | |
| 6 | phải | p | 0.2 | 0 | 196 | 0.36 | leaf-xoai | back | ✓ | |
| 7 | phải | ả | 0.5 | 1 | 6 | 0.24 | flower-lai | front | ✓ | |
| 8 | phải | h | 0.25 | 1 | 22 | 0.30 | flower-su | front | | |
| 9 | là | l | 0.5 | 1 | -8 | 0.42 | leaf-trau | back | | |
| 10 | rác. | c | 1 | 0.5 | 78 | 0.26 | leaf-non | back | | ✓ |
| 11 | rác. | . | 0.5 | 1 | 0 | 0.34 | sprout | front | ✓ | |

Mục 11 là chi tiết "dấu chấm là hạt giống, mầm mọc lên từ đó", mọc **sau cùng**.

**Trình tự:**
1. Viết từng nét theo thứ tự của script. Mỗi nét kéo dài `clamp(minStroke, maxStroke, len / speed)`. Nét tiếp theo bắt đầu ở `overlap` (70%) thời lượng nét trước. Cộng thêm `glyphGap` khi sang chữ cái mới, `wordGap` khi sang từ mới.
2. Viết xong một sub-timeline `write` thì ép nó về `writeDuration` (`write.duration(lite ? 1.2 : 1.8)`; GSAP tự đổi timeScale). Thêm label `"written"` vào timeline cha ngay tại điểm viết xong.
3. Ảnh lá thấm vào chữ: `[data-ink-texture]` opacity 0 → 1 tại `"written"`, kéo dài 0.9s.
4. Cây bắt đầu mọc từ 70% thời gian viết, cây sau cách cây trước 0.09s. Hoa và mầm chậm thêm `accentDelay`.
   - lá: `{ scale: 0, rotation: -28 } → { scale: 1, rotation: 0, duration: 0.75, ease: "back.out(1.6)" }`
   - hoa: `{ scale: 0, rotation: -90 } → { scale: 1, rotation: 0, duration: 0.6, ease: "back.out(2.2)" }`
   - mầm: `scaleY 0 → 1` (0.4s, `power2.out`), rồi `scaleX 0.3 → 1` (0.35s, `back.out(2)`)
   - Mọi cây: `gsap.set(plant, { svgOrigin: "0 0" })` trước khi tween, để xoay và phóng quanh cuống.
5. Đung đưa (`data-sway`): `gsap.to(plant, { rotation: "+=3", duration: 2.4–3.2 (mỗi lá một số cố định, ví dụ 2.4 / 2.8 / 3.2), ease: "sine.inOut", yoyo: true, repeat: -1 })`. **Không** được thêm vào timeline intro, vì repeat -1 làm timeline chạy mãi. Làm hàm riêng `startInkSway(el)` trả về hàm dừng. Tạm dừng khi hero ra khỏi màn hình (`ScrollTrigger` với `onToggle`).

## 6.2 `vine`: dây leo dưới chân chữ

- Viết theo từ: mọi nét của từ `i` cùng chạy trong `wordDur`, bắt đầu ở `i × wordStagger`.
- Dây leo của từ `i` (`word.vine.d`, nằm trong `data-ink-back`, `stroke` màu `var(--color-gc-600)`, độ dày `vineStroke`, `pathLength="1"`, đầu tròn, không fill) chạy **cùng lúc** với từ đó, thời lượng `wordDur × vineDurScale`, `ease: "none"`. Các đoạn dây nối nhau thành một dây liền dọc mỗi dòng.
- Lá trên dây: tại mỗi `node`, đặt một lá theo `side`:
  - `side = 1`: lá chỉa lên, góc ±50° (luân phiên), `size 0.18`, sprite luân phiên `leaf-non` / `leaf-xoai`, lớp `back` (nấp sau chân chữ).
  - `side = -1`: lá chỉa xuống, góc 180 ± 40°, `size 0.11`.
  - Lá bật ra đúng lúc đầu dây đi qua: `thời điểm bắt đầu dây + node.t × thời lượng dây`, tween `scale 0 → 1` theo `leafPop`.
  - Điện thoại: chỉ hiện node chẵn.
- Cuối dây của từ cuối (`nay`): một `flower-su`, `size 0.32`, nở ở cuối cùng (hoa theo kiểu 6.1).
- Lá trên dây do component tự sinh từ `vine.nodes` (không cần ghi trong `plants.ts`), nhưng vẫn phải có `data-ink-plant`, `data-kind`, `data-lite` như mọi cây khác.

## 6.3 `sprout`: mỗi h3 một "chữ ký" riêng, cộng số làm bằng lá

| h3 | word | char | u | v | angle | size | sprite | layer | Kiểu mọc |
|---|---|---|---|---|---|---|---|---|---|
| feature-1 | phút | t | 0.5 | 1 | 4 | 0.62 | sprout | front | mầm: scaleY rồi scaleX (như 6.1) |
| feature-2 | loại, | l | 0.5 | 1 | -6 | 0.50 | flower-muoigio | front | hoa: xoay -120° → 0, `back.out(2.4)` |
| feature-2 | loại, | l | 0.5 | 1 | -48 | 0.30 | leaf-non | back | lá (như 6.1), mọc trước hoa |
| feature-2 | loại, | l | 0.5 | 1 | 44 | 0.26 | leaf-non | back | lá (như 6.1), mọc trước hoa |
| feature-3 | nhà | h | 0.3 | 1 | 18 | 0.66 | twig | back | cành: `{ scale: 0, rotation: -35 } → { scale: 1, rotation: 0, duration: 1.1, ease: "elastic.out(1, 0.55)" }` |

Mọi cây h3 đều có `lite`.

**Số 01 / 02 / 03 làm bằng lá** (giống ảnh mẫu nhất, vì số là chữ Montserrat to):
- Đổi `<span ... className="font-brand text-[64px] leading-none text-gc-400">` thành có thêm `data-ink-number` và class `lobby-ink-number`. Giữ `aria-hidden`.
- CSS:
  ```css
  .lobby-ink-number { color: var(--color-gc-400); }
  @supports ((-webkit-background-clip: text) or (background-clip: text)) {
    .lobby-ink-number {
      background: url("/lobby/ink/texture-foliage.webp") center / 240px repeat;
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }
  }
  ```
- Hiện ra bằng `clipPath: "inset(100% 0% 0% 0%)" → "inset(0% 0% 0% 0%)"` (mọc từ dưới lên), rồi h3 bắt đầu viết khi số chạy được 0.15s.

Trình tự trong một khối tính năng: ảnh mở (đã có) → số mọc lên → h3 viết theo chữ cái → cây chữ ký mọc → đoạn mô tả và các bước trượt lên (đã có).

## 6.4 `chalk`: lá tối trồi lên sau lưng chữ trắng

Các từ: `Nhà` `bạn` `đang` `có` `gì` `cần` `dọn?`

| # | word | char | u | v | angle | size | sprite | layer | lite |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Nhà | N | 0.1 | 1 | -24 | 0.50 | leaf-xoai-dark | back | |
| 2 | Nhà | h | 0.3 | 1 | 14 | 0.40 | leaf-trau-dark | back | ✓ |
| 3 | đang | đ | 0.6 | 1 | -6 | 0.44 | leaf-duongxi-dark | back | ✓ |
| 4 | đang | g | 0.4 | 0 | 190 | 0.30 | leaf-non-dark | back | |
| 5 | dọn? | d | 0.7 | 1 | 20 | 0.40 | leaf-trau-dark | back | |
| 6 | dọn? | ? | 0.5 | 0.05 | 0 | 0.30 | flower-su | front | ✓ |

- Viết theo nét như hero nhưng dùng thông số `chalk` (nhanh, bút mảnh). Không có ảnh lá trong chữ.
- Lá **trồi lên từ sau chữ**: `{ y: fromY × upm, scale: 0.7, opacity: 0 } → { y: 0, scale: 1, opacity: 1 }`, bắt đầu khi viết được 60%, cây sau cách cây trước 0.1s. Vì `y` nằm trong hệ tọa độ đã xoay của lá, lá sẽ trượt ra **dọc theo thân của chính nó**.
- Hoa trên dấu "?" nở sau cùng (kiểu hoa ở 6.1). Đây là điểm nhấn duy nhất ở lớp trước.

# 7. GẮN VÀO CODE ĐANG CÓ

## 7.1 Hero (`LobbyHero.tsx` + `intro.ts`)
- Thay thẻ `<h1 id="hero-title" data-split-title data-intro className="...">` bằng:
  `<InkHeading as="h1" inkId="hero" variant="hero" id="hero-title" data-intro className="(giữ nguyên class cũ)" />`.
- `intro.ts`:
  - Bỏ `SplitText` cho tiêu đề. Lấy `title = root.querySelector("[data-ink-variant=hero]")`.
  - **Trước** `root.classList.add("is-ready")`: gọi `setInkInitial(title)`.
  - `const ink = buildInkTimeline(title, { lite }); tl.add(ink, I.title.at);`
  - `titleEnd = I.title.at + ink.labels.written`. Slogan bắt đầu ở `titleEnd - I.slogan.overlap`, giữ nguyên như cũ.
  - **Finale (nút CTA, header, gợi ý cuộn):** đặt ở **thời điểm tính sẵn** = lúc slogan xong − `I.finale.overlap`, **không** dùng `">-..."` nữa. Nếu dùng `">"`, finale sẽ phải đợi lá mọc xong.
  - Bỏ `onComplete: () => split?.revert()`.
  - `playReducedIntro`: không cần thêm gì, vì HTML đã là trạng thái cuối.
- `LobbyPage.tsx`: trong nhánh `desktop && finePointer`, thêm `startInkSway(heroTitle)` vào `whenIntroDone`, và gọi hàm dừng khi dọn dẹp. Nếu `SplitText` không còn chỗ nào dùng (tìm bằng grep), xóa import và `registerPlugin` của nó.

## 7.2 Tính năng (`LobbyFeatures.tsx` + `sections.ts`)
- h2: `<InkHeading as="h2" inkId="features" variant="vine" id="features-title" className="(giữ nguyên)" />`.
- Mảng `FEATURES`: thay trường `title` bằng `inkId: "feature-1" | "feature-2" | "feature-3"`. `key` lấy từ `inkId`. h3: `<InkHeading as="h3" inkId={f.inkId} variant="sprout" className="(giữ nguyên)" />`.
- `revealFeatures`:
  - Phần trượt lên của chữ chỉ áp cho các con **không phải** `[data-ink]` và `[data-ink-number]`.
  - Thêm số mọc lên + h3 viết vào **cùng timeline** của khối đó. `lite = !clip`.
- Hàm mới `revealInkHeadings(root, lite)` trong `sections.ts`: với mỗi `[data-ink-variant=vine], [data-ink-variant=chalk]`, gọi `setInkInitial`, tạo timeline có `scrollTrigger: { trigger: el, start: INK_MOTION[v].trigger, once: true }`. Gọi trong `mmLayout` cạnh `revealFeatures` (chỉ khi motionOK), truyền `lite = !!c.mobile`.

## 7.3 CTA (`LobbyCta.tsx`)
`<InkHeading as="h2" inkId="cta" variant="chalk" id="cta-title" className="(giữ nguyên)" />`

## 7.4 `src/lobby/animations/ink.ts` phải export
```ts
export function setInkInitial(el: HTMLElement): void;   // ẩn nét, cây, ảnh lá; set svgOrigin "0 0" cho mọi [data-ink-plant]
export function buildInkTimeline(el: HTMLElement, opts: { lite: boolean }): gsap.core.Timeline; // có label "written"
export function startInkSway(el: HTMLElement): () => void;
```
- `buildInkTimeline` đọc `el.dataset.inkVariant`, rẽ nhánh theo `INK_MOTION[variant].unit` (`stroke` / `word` / `glyph`). Phần cây rẽ nhánh theo `data-kind` (`leaf` / `flower` / `sprout` / `twig`) và theo biến thể (`chalk` dùng kiểu trồi lên).
- Khi `lite`, bỏ qua mọi `[data-ink-plant]` không có `data-lite`.
- Chỉ animate `transform`, `opacity`, `stroke-dashoffset`. Không animate `width`, `height`, `filter`, `d`.

# 8. ẢNH CẦN TẠO

## 8.1 Phong cách chung
Ảnh chụp macro thật, cây cỏ đường phố Sài Gòn, sáng sớm. Ánh sáng tự nhiên dịu từ **phía trên bên phải**, chi tiết gân lá sắc nét, màu xanh tự nhiên hơi ngả rêu. **Nền phẳng một màu magenta `#FF00FF`**, không bóng đổ lên nền, không có vật gì khác.
Phủ định (thêm vào mọi prompt): `no text, no watermark, no shadow on background, no other objects, no water drops, no glow, no CGI look, no pink or magenta in the plant itself`.

## 8.2 Danh sách: lưu ảnh thô vào `assets-src/ink/<key>.png`

| key | Mô tả cho công cụ tạo ảnh (tiếng Anh) | pivot |
|---|---|---|
| `leaf-trau` | a single fresh betel leaf (heart-shaped), stem at the bottom center, tip pointing straight up | base |
| `leaf-xoai` | a single long slender mango leaf, slightly curved, stem at the bottom center, tip pointing straight up | base |
| `leaf-non` | a single young light-green leaf, slightly curled, stem at the bottom center, tip pointing up | base |
| `leaf-duongxi` | a single small fern frond, stem at the bottom center, pointing up | base |
| `flower-su` | one white plumeria (frangipani) flower with yellow center, seen from the front | center |
| `flower-lai` | a tiny cluster of three white jasmine flowers, seen from the front | center |
| `flower-muoigio` | one pale yellow portulaca (moss rose) flower, seen from the front | center |
| `sprout` | a bean sprout seedling with two round seed leaves on a thin stem, stem bottom at the bottom center | base |
| `twig` | a small twig with five tamarind-style leaves, cut end at the bottom center, pointing up | base |
| `texture-foliage` | seamless top-down photo of dense overlapping green tropical leaves filling the whole frame, no gaps, 1:1 (**nền thật, KHÔNG magenta**) | – |

## 8.3 Script `scripts/ink-headings/sprites.mjs`
- Sao chép `keyOutBackground` từ `scripts/lobby-assets/process.mjs` sang đây. Không import, không sửa file gốc.
- Ảnh có pivot `base`: tách nền → `trim()` → co vừa khung 360×360 → đặt lên canvas trong suốt 384×384, **dính đáy, giữa ngang** (chừa 12px ở đáy).
- Ảnh có pivot `center`: tương tự nhưng đặt **chính giữa**.
- Xuất `public/lobby/ink/<key>.webp` (quality 80, alphaQuality 90, effort 6). **Mỗi ảnh ≤ 30 KB.**
- Sinh thêm bản `-dark` cho 4 ảnh lá (`leaf-trau-dark`, `leaf-xoai-dark`, `leaf-non-dark`, `leaf-duongxi-dark`): `.modulate({ brightness: 0.55, saturation: 0.75 })`.
- `texture-foliage`: cắt vuông 1024×1024 → `texture-foliage.webp` (≤ 140 KB). Bản tối `texture-foliage-dark.webp` (≤ 110 KB): giảm sáng tới khi **độ sáng trung bình ≤ 0.22 và phân vị 95 ≤ 0.42** (độ sáng 0–1, tính từ dữ liệu raw). Script phải tự đo và in ra 2 con số này, không đạt thì báo lỗi và thoát với mã ≠ 0. Ngưỡng này giữ chữ hero đủ đọc trên nền trời sáng.
- Nếu ảnh lá bị quay sai hướng (đầu lá không chỉa lên), thêm `rotate` cho key đó trong bảng cấu hình của script. **Không** sửa góc trong `plants.ts` để bù.

# 9. HIỆU NĂNG, TRỢ NĂNG, ĐIỆN THOẠI

- Trình đọc màn hình chỉ đọc `sr-only`. Mọi SVG đều nằm trong `aria-hidden="true"`.
- "Giảm chuyển động": không ẩn gì, không chạy gì. Tiêu đề đã hoàn chỉnh từ HTML (hero vẫn hiện dần qua `playReducedIntro` như cũ).
- Điện thoại (< 768px): chỉ hiện cây có `lite`, không đung đưa, hero viết trong 1.2s.
- Đung đưa phải dừng khi hero ra khỏi màn hình.
- Không thêm `filter`, `drop-shadow` hay `backdrop-filter` lên SVG đang chuyển động.
- Giữ 60 fps: kiểm tra bằng tab Performance (CPU throttle 4×) lúc intro hero chạy, không có khung hình đỏ dài hơn 50ms do phần này gây ra.

# 10. CÁC BƯỚC LÀM (đúng thứ tự, mỗi bước có điểm dừng kiểm tra)

1. **Font + script build.** Cài `opentype.js` (devDependency), tải font, viết `sources.ts`, `types.ts`, `build.mjs`. Chạy `npm run ink:build`.
   *Kiểm tra:* không lỗi; bảng in ra đủ 6 id; file sinh ra ≤ 70 KB.
2. **`InkHeading` tĩnh, chưa có animation và cây.** Thay 6 tiêu đề. Chạy `NEXT_PUBLIC_INK_DEBUG=1 npm run dev -- -p 3100`.
   *Kiểm tra:* chụp màn hình ở 375px, 768px, 1440px. Chữ SVG phải **trùng khít** lớp chữ đỏ (lệch ≤ 2px), xuống dòng ở **đúng cùng chỗ**, khoảng cách dòng không đổi so với trước khi sửa. Lệch thì sửa công thức ở 5.3, **không** chỉnh tay bằng margin.
   *Kiểm tra lỗ hổng:* phóng to 400%, lòng chữ không có lỗ hổng. Có lỗ thì tăng `PEN`.
3. **Ảnh.** Tạo 10 ảnh thô, viết `sprites.mjs`, chạy `npm run ink:sprites`.
   *Kiểm tra:* mở từng webp, cuống lá ở giữa đáy, đầu lá chỉa lên, viền không còn ám hồng.
4. **Cây tĩnh.** Viết `sprites.ts`, `plants.ts`, dựng cây trong `InkHeading`.
   *Kiểm tra:* chụp 3 cỡ màn hình. Hero trông giống ảnh mẫu: lá mọc ra từ chữ, có lá trước và sau chữ. Không lá nào đè lên dòng chữ khác quá 1/4 diện tích một con chữ.
5. **Animation.** Viết `ink.ts`, gắn vào `intro.ts`, `sections.ts`, `LobbyPage.tsx`.
6. **Test.** Viết `scripts/tests/ink-headings.test.mjs` (mục 11).
7. **Build production.** `npm run build`, rồi `npx next start -p 3100`. Port 3000 là của người dùng, không dùng. Dừng server xong thì tắt tiến trình node còn chiếm port 3100.

# 11. ĐỊNH NGHĨA HOÀN THÀNH (tất cả phải đạt)

**Lệnh:**
- [ ] `npm run ink:build` không lỗi, và chạy lại lần 2 thì `git diff --stat src/lobby/ink/glyphs.generated.ts` không đổi (kết quả ổn định).
- [ ] `npm run ink:sprites` không lỗi, in ra số đo độ sáng của texture đạt ngưỡng.
- [ ] `npm test` đạt. `scripts/tests/ink-headings.test.mjs` phải kiểm tra:
  - `text` trong file sinh ra === `INK_SOURCES[i].text.normalize("NFC")` cho cả 6 id.
  - Ghép `words[].text` bằng dấu cách ra đúng câu gốc.
  - Mọi mục trong `plants.ts` tìm được đúng `word` và `char`.
  - Mọi `sprite` trong `plants.ts` có trong `INK_SPRITES`, file tồn tại và ≤ `maxKB`.
  - `INK_PEN[v] ≥ 1.8 ×` độ rộng nét lớn nhất (ghi số này vào file sinh ra để test đọc).
  - 4 khối trong `INK_MOTION` khác nhau ít nhất ở `unit` hoặc tốc độ, và đúng như bảng ở mục 6.
  - Không file nào trong `src/lobby/**` chứa `Math.random` hay `opentype`.
- [ ] `npm run lint` không có lỗi mới.
- [ ] `npx tsc --noEmit` không lỗi.
- [ ] `npm run build` thành công.

**Bằng mắt** (ghi hình hoặc chụp từng khung, bản production, cổng 3100):
- [ ] Hero ở 1440px, chụp tại 0.4s / 1.0s / 1.6s / 2.4s / 3.5s sau khi tải: thấy rõ chữ hiện **theo từng nét**, dấu thanh hiện **sau** chữ của từng từ, rồi lá và hoa nở ra, chữ thấm thành chữ lá, mầm mọc từ dấu chấm cuối cùng.
- [ ] Nút "Bắt đầu ngay" hiện trước giây thứ 3.
- [ ] Hero ở 375px: chỉ 5 cây, không cây nào che nút hay slogan.
- [ ] Cuộn xuống: h2 tính năng viết theo từng từ, dây leo bò dưới chân chữ, lá bật theo đầu dây.
- [ ] 3 khối tính năng: số 01/02/03 làm bằng lá mọc lên, h3 viết nhanh, mỗi h3 có cây riêng (mầm / hoa / cành).
- [ ] CTA: chữ trắng viết nhanh, lá tối trồi lên sau chữ, hoa nở ở dấu "?".
- [ ] Đặt 4 biến thể cạnh nhau: nhìn là biết cùng một họ, nhưng không cái nào giống hệt cái nào.
- [ ] Bật "giảm chuyển động" của hệ điều hành: mọi tiêu đề hiện đầy đủ (có cả lá), không có chuyển động viết.
- [ ] Tắt JavaScript: mọi tiêu đề vẫn đọc được, đầy đủ, không lỗ hổng.
- [ ] Đổi cỡ cửa sổ qua lại 767 ↔ 768 ↔ 1024px: không tiêu đề nào bị kẹt ở trạng thái ẩn.
- [ ] Console trình duyệt không có lỗi hay cảnh báo hydration.

# 12. KHI GẶP KHÓ

- **Link font 404:** tìm `BeVietnamPro-ExtraBold.ttf` trong repo `google/fonts`, thư mục `ofl/bevietnampro`. Nếu vẫn không có, dừng lại và hỏi người dùng. **Không** đổi sang font khác.
- **Chữ SVG lệch so với lớp đỏ:** kiểm tra lại letter-spacing (`trackingEm`), kerning, và đã `normalize("NFC")` chưa. Không chỉnh tay từng từ.
- **Lá che chữ khó đọc:** giảm `size` hoặc chuyển cây đó sang `back`. Không bỏ cây khỏi bảng mà không ghi lý do trong báo cáo.
- **Tạo ảnh 3 lần vẫn sai hướng:** xoay bằng script (mục 8.3).
- **Hiệu năng không đạt:** giảm số cây không có `lite` trước, rồi mới giảm thời lượng.
- **Thấy cần sửa file ngoài danh sách ở mục 4:** dừng lại và hỏi người dùng.

# 13. BÁO CÁO CUỐI (gửi trong khung chat, tiếng Việt)
1. Danh sách file đã tạo và đã sửa.
2. Kết quả của từng lệnh ở mục 11 (dán dòng cuối của output).
3. Ảnh chụp: hero ở 5 mốc thời gian, mỗi biến thể ở trạng thái cuối, hero trên điện thoại.
4. Mọi chỗ làm khác bảng thông số, kèm lý do.
5. Nhắc người dùng tự commit (bạn không commit).

## KẾT THÚC PROMPT
