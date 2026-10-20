# BÁO CÁO ĐIỀU TRA & TỐI ƯU HÓA TOÀN DIỆN (BOOST REPORT): PROMPT LÀM LẠI TOÀN BỘ ẢNH NỘI DUNG GREEN CITY

**Tài liệu mục tiêu**: [`c:/123/docs/prompt-gemini-sua-anh-noi-dung.md`](file:///c:/123/docs/prompt-gemini-sua-anh-noi-dung.md)  
**Mục tiêu**: Điều tra thực chứng hiện trạng mã nguồn, tài nguyên ảnh, dữ liệu và công cụ trong dự án `c:\123`; phát hiện toàn bộ bẫy kỹ thuật, lỗ hổng logic và điểm thiếu sót trong prompt hiện tại; cung cấp giải pháp kỹ thuật, Thư viện Prompt tiếng Anh chi tiết chuẩn xác cho toàn bộ 39 ảnh còn lại, mã nguồn chuẩn cho các tệp cốt lõi, và quy trình thực thi không lỗi (zero-hallucination).

---

## PHẦN 1: ĐIỀU TRA THỰC CHỨNG HIỆN TRẠNG MÃ NGUỒN VÀ TÀI NGUYÊN (GROUND TRUTH AUDIT)

Sau khi trực tiếp quét hệ thống tệp và thực thi các kịch bản kiểm thử trên môi trường Windows PowerShell (`c:\123`), chúng tôi xác nhận các số liệu thực tế như sau:

### 1.1 Hiện trạng 51 ảnh nội dung trên đĩa (`public/content/`)
Dự án yêu cầu tổng cộng **51 ảnh nội dung**, hiện trạng thực tế phân chia thành 2 nhóm: **12 ảnh đạt chuẩn** và **39 ảnh cần thay thế/tạo mới**:

```
                                  TỔNG SỐ 51 ẢNH NỘI DUNG
  ┌──────────────────────────────────────────────┬──────────────────────────────────────────────┐
  │         12 ẢNH ĐẠT CHUẨN (GIỮ NGUYÊN)        │          39 ẢNH CHƯA ĐẠT (CẦN TẠO MỚI)       │
  ├──────────────────────────────────────────────┼──────────────────────────────────────────────┤
  │ • learn:   8/8 ảnh (100% đạt chuẩn)          │ • rewards:  5/8 ảnh cũ sai đồ từ Unsplash     │
  │ • rewards: 3/8 ảnh đạt chuẩn                 │ • shops:    8/8 ảnh cũ sai đồ / ảnh trống    │
  │ • products: 1/15 ảnh đạt chuẩn (sat-vun)     │ • swap:    12/12 ảnh cũ sai đồ từ Unsplash    │
  │                                              │ • products: 14/15 ảnh chưa có tệp nội bộ    │
  └──────────────────────────────────────────────┴──────────────────────────────────────────────┘
```

#### Chi tiết 12 ảnh đã đạt chuẩn (Đã kiểm chứng kích thước và dung lượng WebP):
- `learn/` (8/8 ảnh):
  - [`phan-loai-rac-tai-nha.webp`](file:///c:/123/public/content/learn/phan-loai-rac-tai-nha.webp): 1200×900, 83 KB.
  - [`chuan-bi-ve-chai-ban-duoc-gia.webp`](file:///c:/123/public/content/learn/chuan-bi-ve-chai-ban-duoc-gia.webp): 1200×900, 118 KB.
  - [`u-phan-huu-co-thung-xop.webp`](file:///c:/123/public/content/learn/u-phan-huu-co-thung-xop.webp): 1200×900, 122 KB.
  - [`u-vo-trai-cay-nuoc-ngam-enzyme.webp`](file:///c:/123/public/content/learn/u-vo-trai-cay-nuoc-ngam-enzyme.webp): 1200×900, 72 KB.
  - [`di-cho-it-tui-nilon.webp`](file:///c:/123/public/content/learn/di-cho-it-tui-nilon.webp): 1200×900, 141 KB.
  - [`pin-bong-den-thuoc-het-han.webp`](file:///c:/123/public/content/learn/pin-bong-den-thuoc-het-han.webp): 1200×900, 45 KB.
  - [`vong-doi-moi-cho-quan-ao-cu.webp`](file:///c:/123/public/content/learn/vong-doi-moi-cho-quan-ao-cu.webp): 1200×900, 93 KB.
  - [`sua-do-gia-dung-truoc-khi-vut.webp`](file:///c:/123/public/content/learn/sua-do-gia-dung-truoc-khi-vut.webp): 1200×900, 110 KB.
- `rewards/` (3/8 ảnh):
  - [`phan-huu-co-2kg.webp`](file:///c:/123/public/content/rewards/phan-huu-co-2kg.webp): 800×800, 36 KB.
  - [`phan-trun-que-1kg.webp`](file:///c:/123/public/content/rewards/phan-trun-que-1kg.webp): 800×800, 35 KB.
  - [`tui-vai-di-cho.webp`](file:///c:/123/public/content/rewards/tui-vai-di-cho.webp): 800×800, 41 KB.
- `products/` (1/15 ảnh):
  - [`sat-vun.webp`](file:///c:/123/public/content/products/sat-vun.webp): 1200×900, 150 KB (154.100 bytes – suýt chạm trần 150 KB).

#### Chi tiết 39 ảnh chưa đạt còn lại:
1. **5 ảnh `rewards/` cũ** (800×800): `chau-luoi-ho.webp` (chậu xi măng trắng sai vật liệu), `dung-cu-lam-vuon-mini.webp` (chỉ có cái xẻng lẻ loi), `ly-thuy-tinh-tai-che.webp` (ly giấy cà phê), `ong-hut-inox.webp` (ba người đàn ông ngồi laptop), `tui-luoi-dung-rau.webp` (lồng máy giặt dưới đèn hồng).
2. **8 ảnh `shops/` cũ** (1200×900): `tiem-gon-gang-xanh.webp` (file 2KB chỉ là một ô màu xanh trơn), `dung-cu-xanh-nam-sai-gon.webp` (con gấu nâu ngồi bãi cỏ), `vuon-uom-cay-nha-minh.webp` (chợ sách cũ), `phan-huu-co-ba-la.webp` (cánh đồng lúa mì phương Tây), `xuong-thuy-tinh-tai-sinh.webp` (bình gốm trắng), `nong-trai-dat-lanh.webp` (khay cây con), `tiem-xa-bong-sinh-thai.webp` (xà bông oải hương kiểu Pháp), `vuon-pho-xanh-ri.webp` (tay gieo hạt cận cảnh lệch góc).
3. **12 ảnh `swap/` cũ** (1000×750): `mau-1.webp` (sách kinh doanh tiếng Anh), `mau-2.webp` (áo treo móc tủ), `mau-3.webp` (chảo cơm chiên), `mau-4.webp` (gạch Lego nước ngoài), `s-ao-khoac-jean.webp` (quần jean), `s-sach-giao-khoa-lop-5.webp` (sách giáo trình chữ Tây), `s-noi-com-dien.webp` (nồi áp suất Instant Pot có logo), `s-xe-day-em-be.webp` (phòng ngủ khách sạn), `s-vay-cong-so.webp` (quần nỉ thể thao vàng ở sân bóng rổ), `s-truyen-tranh.webp` (tranh anime dán tường), `s-bo-chen-bat.webp` (ly sứ), `s-lego-hop.webp` (phi thuyền Lego Star Wars trên đường nhựa).
4. **14 ảnh `products/` chưa có**: `giay-vun.webp`, `nhua-cac-loai.webp`, `chai-lo-thuy-tinh.webp`, `do-dien-tu-cu.webp`, `do-gia-dung-thanh-ly.webp`, `carton-ep-kien.webp`, `chai-pet.webp`, `lon-nhom.webp`, `quat-cay-cu.webp`, `ban-go-cu.webp`, `giay-bao-cu.webp`, `chai-thuy-tinh-nguyen.webp`, `may-tinh-ban-cu.webp`, `ghe-go.webp`.

---

### 1.2 Dữ liệu nguồn `src/data/mock-data.ts`
Trong [`src/data/mock-data.ts#L4-L20`](file:///c:/123/src/data/mock-data.ts#L4-L20):
```ts
export const IMAGES = {
  paper: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/ce3ae40f7fb9.jpg",
  plastic: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/095bde95f3a7.jpg",
  metal: "/content/products/sat-vun.webp", // <-- Duy nhất 1 link đã trỏ local
  glass: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/d6e3fdb6c72a.jpg",
  electronic: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/597b72687514.jpg",
  furniture: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/117c9484c202.jpg",
  cardboard: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/428cdcba5b30.jpg",
  petBottles: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/2687c0ec2e81.jpg",
  aluminum: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/7d61ef35f55a.jpg",
  fan: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/aae3019b91f2.jpg",
  woodenTable: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/207a0ac95ef6.jpg",
  newspaper: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/0e0602dc0b87.jpg",
  glassBottles: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/c83be7da6714.jpg",
  oldPC: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/912c03ad5680.jpg",
  woodenChair: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/a45c5f2cc431.jpg",
} as const;
```
Object `IMAGES` này được import và dùng chung bởi [`src/data/lots.ts`](file:///c:/123/src/data/lots.ts), [`src/data/consults.ts`](file:///c:/123/src/data/consults.ts), và các danh mục/tin đăng trong chính `mock-data.ts`.

---

### 1.3 Kiểm tra tình trạng công cụ và kịch bản hỗ trợ
- [`scripts/collab/content-missing.mjs`](file:///c:/123/scripts/collab/content-missing.mjs): Quét chuỗi `/content/...` trong `src/data/**/*.ts`. Khi chạy hiện tại:
  `Ảnh được nhắc tới trong dữ liệu: 37 | ✓ Không thiếu ảnh nào (0)`.
  Lý do chỉ đếm 37 ảnh là vì 14 ảnh của `IMAGES` chưa được cập nhật đường dẫn `/content/products/...`! Khi cập nhật đủ 15 khóa trong `IMAGES`, con số sẽ nhảy lên 51.
- [`scripts/collab/content-sheet.mjs`](file:///c:/123/scripts/collab/content-sheet.mjs): Chạy thành công và sinh ra 5 bảng soi ảnh:
  `learn.png` (8 ảnh), `rewards.png` (8 ảnh), `shops.png` (8 ảnh), `swap.png` (12 ảnh), `products.png` (1 ảnh).
- [`assets-src/content/capture-pages.mjs`](file:///c:/123/assets-src/content/capture-pages.mjs): Script tự động hóa chụp màn hình qua DevTools Protocol Chrome headless. File thực thi Chrome tại `C:/Program Files/Google/Chrome/Application/chrome.exe` đã được kiểm chứng tồn tại (`Test-Path: True`).
- `npm.cmd run lint`: PASS (0 cảnh báo, 0 lỗi).
- `npm.cmd run build`: PASS (tổng hợp 48/48 routes tĩnh và động).
- `npm.cmd test`: PASS toàn bộ 41/41 test case.

---

## PHẦN 2: PHÁT HIỆN 7 LỖ HỔNG & BẪY KỸ THUẬT TRONG PROMPT HIỆN TẠI

Sau khi phân tích đối chiếu [`docs/prompt-gemini-sua-anh-noi-dung.md`](file:///c:/123/docs/prompt-gemini-sua-anh-noi-dung.md), chúng tôi phát hiện 7 lỗ hổng nghiêm trọng khiến Gemini 3.8 Flash trước đây và các agent tiếp theo rất dễ bị trượt hoặc làm hỏng:

### 2.1 Lỗ hổng 1: Thiếu hoàn toàn Thư viện Prompt tiếng Anh (Prompt Library) cho 39 ảnh còn lại
- **Thực trạng trong prompt**: Mục 5 của tài liệu chỉ đưa ra các mô tả tóm tắt bằng tiếng Việt (ví dụ: *"Bao tải dứa đầy nhựa các loại: thau chậu bể, can nhựa, rổ nhựa cũ"*).
- **Hệ quả**: Agent buộc phải tự dịch sang tiếng Anh và tự tưởng tượng câu lệnh cho công cụ `generate_image`. Việc tự tạo prompt không qua kiểm soát dẫn đến các thảm họa như lần trước (tạo nhầm COVID-19, góc chơi game, máy giặt, gấu bông, siêu thị Tây...).
- **Giải pháp**: Phải trang bị sẵn Thư viện 39 Prompt tiếng Anh chi tiết, chuẩn xác từng góc máy, ánh sáng, chủ thể, bối cảnh Sài Gòn và cấu trúc negative prompt (cung cấp ở Phần 3).

### 2.2 Lỗ hổng 2: Bẫy thực thi PowerShell trên Windows (`npm` vs `npm.cmd` / `node`)
- **Thực trạng**: Prompt hướng dẫn các lệnh như `npm run content:image ...` hay `npm run content:sheet`.
- **Hệ quả trên Windows PowerShell**: Hệ thống người dùng chặn file script PowerShell của Node.js:
  `npm : File C:\Program Files\nodejs\npm.ps1 cannot be loaded because running scripts is disabled on this system.`
- **Giải pháp**: Cần chỉ dẫn agent sử dụng `npm.cmd run ...` hoặc gọi trực tiếp qua Node: `node scripts/collab/content-image.mjs ...`.

### 2.3 Lỗ hổng 3: Mâu thuẫn tỉ lệ Aspect Ratio giữa `generate_image` và Script cắt ảnh
- **Thực trạng**: Kích thước xuất WebP gồm 3 chuẩn:
  - `rewards/`: **800×800** (tỉ lệ 1:1)
  - `learn/`, `shops/`, `products/`: **1200×900** (tỉ lệ 4:3)
  - `swap/`: **1000×750** (tỉ lệ 4:3)
- **Hệ quả**: Script [`content-image.mjs#L33`](file:///c:/123/scripts/collab/content-image.mjs#L33) sử dụng cơ chế `fit: "cover", position: sharp.strategy.attention`. Nếu agent tạo ảnh thô có tỉ lệ khác (ví dụ tạo 16:9 hoặc 1:1 cho `swap`), thuật toán crop sẽ tự ý xén mất các rìa quan trọng của vật thể.
- **Giải pháp**: Bắt buộc chỉ định tham số `AspectRatio: '1:1'` cho nhóm `rewards` và `AspectRatio: '4:3'` cho các nhóm `shops`, `swap`, `products` khi gọi `generate_image`.

### 2.4 Lỗ hổng 4: Bẫy ngưỡng trần dung lượng 150 KB (`MAX_KB = 150`)
- **Thực trạng**: Script [`content-image.mjs#L26-L44`](file:///c:/123/scripts/collab/content-image.mjs#L26-L44) vòng lặp giảm chất lượng từ 72 xuống tối thiểu 50. Nếu dung lượng file vẫn > 150 KB, script sẽ quăng lỗi và thoát mã `process.exit(1)`.
- **Bằng chứng**: Ảnh [`sat-vun.webp`](file:///c:/123/public/content/products/sat-vun.webp) hiện tại có kích thước 154.100 bytes (150.488 KB, làm tròn 150 KB – suýt trượt!). Ảnh `nong-trai-dat-lanh.webp` cũ đạt 145 KB; `di-cho-it-tui-nilon.webp` đạt 141 KB.
- **Giải pháp**: Các prompt tạo ảnh phải có phông nền sạch sẽ, độ sâu trường ảnh dịu mắt, tránh các chi tiết rác vụn li ti phân tán khắp khung hình để bộ nén WebP giữ dung lượng luôn an toàn dưới 120 KB ở quality 72.

### 2.5 Lỗ hổng 5: Kịch bản chụp màn hình tự động `assets-src/content/capture-pages.mjs` bị bỏ quên
- **Thực trạng**: Mục 9 và 10 của prompt yêu cầu agent tự chạy `npx next start -p 3100` và *"xem tận mắt... Mỗi trang chụp màn hình một lần"*. Tuy nhiên prompt không hề nhắc đến việc trong repository đã có sẵn tệp [`assets-src/content/capture-pages.mjs`](file:///c:/123/assets-src/content/capture-pages.mjs).
- **Hệ quả**: Agent không biết cách chụp toàn trang hoặc phải loay hoay với công cụ ngoài. Trong khi đó, `capture-pages.mjs` tự động kết nối Chrome headless qua CDP, tự động tiêm mock session, tự cuộn trang tải toàn bộ lazy image và chụp sắc nét 5 trang vào `assets-src/content/_check/`.
- **Giải pháp**: Bổ sung hướng dẫn gọi trực tiếp `node assets-src/content/capture-pages.mjs` vào quy trình hoàn thiện.

### 2.6 Lỗ hổng 6: Bẫy thứ tự cập nhật dữ liệu (Execution Ordering Trap)
- **Thực trạng**: Script `content-missing.mjs` quét các link `/content/...` trên tệp `.ts`.
- **Rủi ro**: Nếu agent cập nhật `src/data/mock-data.ts` trước khi tạo xong 14 ảnh sản phẩm mới, `content:missing` sẽ lập tức báo `FAIL (thiếu 14 ảnh)`. Ngược lại, nếu tạo ảnh xong mà quên sửa `mock-data.ts`, `content:sheet` sẽ không hiển thị 14 ảnh mới trong bảng soi `products.png`.
- **Giải pháp**: Quy chuẩn hóa thứ tự: Tạo xong toàn bộ ảnh thô → Chuyển sang WebP → Cập nhật `mock-data.ts` → Chạy `content:missing` → Chạy `content:sheet`.

### 2.7 Lỗ hổng 7: Nguy cơ chạy nhầm tệp `assets-src/content/process.mjs` độc hại
- **Thực trạng**: Trong thư mục `assets-src/content/` vẫn còn tồn tại tệp [`process.mjs`](file:///c:/123/assets-src/content/process.mjs) (479 dòng). Đây là tệp từ lần làm hỏng trước, chứa danh sách ID ảnh Unsplash nước ngoài bị gán sai lệch.
- **Rủi ro**: Agent mới vào có thể chạy nhầm script này và ghi đè ảnh hỏng lên các ảnh đã đạt chuẩn.
- **Giải pháp**: Đưa ra cảnh báo đỏ cấm tuyệt đối không đụng vào `assets-src/content/process.mjs`.

---

## PHẦN 3: THƯ VIỆN PROMPT TIẾNG ANH CHI TIẾT CHO 39 ẢNH CÒN LẠI (PRODUCTION PROMPT LIBRARY)

Dưới đây là bộ prompt tiếng Anh được xây dựng tỉ mỉ theo đúng chuẩn phong cách Sài Gòn (đời thường, chân thực, ánh sáng ban ngày tự nhiên, chủ thể chiếm ~60% khung hình, có chừa lề, triệt tiêu hoàn toàn chữ viết và dị tật AI).

### Negative Prompt Chuẩn Hóa Dùng Chung (Phủ định):
```
no readable text, no letters, no words, no signs, no typography, no brand names, no logos, no labels with writing, no watermark, no copyrighted characters, no western architecture, no western supermarket, no extra fingers, no distorted hands, no deformed objects, nobody looking at the camera, no neon, no cinematic lens flare, no oversaturation, no 3D render look, no CGI plastic texture
```

---

### 3.1 Nhóm Quà Đổi Điểm: `public/content/rewards/` (800×800, AspectRatio: '1:1')

1. **`chau-luoi-ho.webp`** (Chậu cây lưỡi hổ nhỏ)
   - **Tên thô**: `assets-src/content/rewards/chau-luoi-ho.png`
   - **Aspect Ratio**: `1:1`
   - **Prompt**:
     `A clean studio product photograph of a small snake plant (sansevieria) about 25cm tall with sharp upright variegated green and yellow leaves, planted in an unglazed reddish-orange terracotta clay pot with saucer, centered on a light warm wooden surface against a neutral soft beige wall, soft diffuse morning daylight from the upper-right, natural leaf waxy texture and realistic soil granules, clean e-commerce presentation with comfortable margins around the plant, no text, no logo` + Phủ định chung.

2. **`dung-cu-lam-vuon-mini.webp`** (Bộ dụng cụ làm vườn mini)
   - **Tên thô**: `assets-src/content/rewards/dung-cu-lam-vuon-mini.png`
   - **Aspect Ratio**: `1:1`
   - **Prompt**:
     `A product shot of a complete 3-piece mini gardening tool set neatly arranged on a rustic wooden table: a small hand trowel with wooden handle and black metal blade, a matching three-prong hand cultivator rake with wooden handle, and a compact 1-liter minimalist green metal watering can, resting beside a tiny clay pot with dark potting soil, bright soft natural daylight, centered composition occupying 60% of the frame, crisp clean details, no brand name, no text` + Phủ định chung.

3. **`ly-thuy-tinh-tai-che.webp`** (Ly thủy tinh tái chế)
   - **Tên thô**: `assets-src/content/rewards/ly-thuy-tinh-tai-che.png`
   - **Aspect Ratio**: `1:1`
   - **Prompt**:
     `A product photograph of a 350ml handcrafted tumbler glass made from recycled glass with a subtle natural pale aquamarine green tint and delicate tiny air bubbles trapped inside the thick glass walls, filled with clear iced tea and ice cubes, placed on a plain untreated light wooden table, soft morning sunlight casting gentle translucent shadows, centered frame, clean natural lifestyle aesthetic, no logo, no labels, no text` + Phủ định chung.

4. **`ong-hut-inox.webp`** (Bộ ống hút inox kèm cọ rửa)
   - **Tên thô**: `assets-src/content/rewards/ong-hut-inox.png`
   - **Aspect Ratio**: `1:1`
   - **Prompt**:
     `A flat lay product photograph of a reusable stainless steel straw set on a textured off-white linen cloth: exactly two straight stainless steel straws, two curved stainless steel straws, one slim wire cleaning brush with natural bristles, accompanied by a small unbleached drawstring canvas pouch and a clear drinking glass with water and fresh lime slices nearby, bright soft studio light, centered arrangement, no text, no engraving, no brand` + Phủ định chung.

5. **`tui-luoi-dung-rau.webp`** (Bộ 3 túi lưới đựng rau)
   - **Tên thô**: `assets-src/content/rewards/tui-luoi-dung-rau.png`
   - **Aspect Ratio**: `1:1`
   - **Prompt**:
     `A studio product photograph of a set of 3 reusable organic cotton mesh produce bags with drawstrings in three distinct sizes (large, medium, small) arranged together on a light wooden countertop, filled respectively with fresh red tomatoes, green okra, and crisp lettuce leaves visible through the natural beige mesh weave, soft warm daylight, centered composition with plenty of margin, eco-friendly shop aesthetic, no tags with writing, no logo, no text` + Phủ định chung.

---

### 3.2 Nhóm Cửa Hàng Xanh: `public/content/shops/` (1200×900, AspectRatio: '4:3')

6. **`phan-huu-co-ba-la.webp`** (Phân hữu cơ Ba Lá - Gò Vấp)
   - **Tên thô**: `assets-src/content/shops/phan-huu-co-ba-la.png`
   - **Aspect Ratio**: `4:3`
   - **Prompt**:
     `Documentary photo inside an organic composting workshop under a corrugated metal roof in Ho Chi Minh City, large organized windrows of dark curing compost piles on concrete floor, stacked unprinted burlap sacks, a metal wheelbarrow standing nearby, a Vietnamese worker in conical hat (non la) and workwear turning compost with a pitchfork in the background seen from side, warm daylight streaming through open eaves, authentic agricultural workshop atmosphere, no readable text, no banners` + Phủ định chung.

7. **`tiem-gon-gang-xanh.webp`** (Tiệm Gọn Gàng Xanh - Quận 1)
   - **Tên thô**: `assets-src/content/shops/tiem-gon-gang-xanh.png`
   - **Aspect Ratio**: `4:3`
   - **Prompt**:
     `Interior shot of a cozy zero-waste boutique shop inside a Vietnamese townhouse, warm natural wood display shelves stocked neatly with plain unprinted canvas tote bags, brushed stainless steel water bottles, bamboo toothbrushes in ceramic cups, rolls of patterned beeswax food wraps, and handmade herbal soaps, warm natural daylight filtering through front doorway, charming Ho Chi Minh City sustainable store, no readable text, no brand logos, no price tags` + Phủ định chung.

8. **`xuong-thuy-tinh-tai-sinh.webp`** (Xưởng Thủy Tinh Tái Sinh - Quận 7)
   - **Tên thô**: `assets-src/content/shops/xuong-thuy-tinh-tai-sinh.png`
   - **Aspect Ratio**: `4:3`
   - **Prompt**:
     `Atmospheric documentary photo inside an artisanal glassblowing recycling workshop in Saigon, glowing orange-hot furnace in the background, an artisan craftsman holding a long metal blowpipe shaping molten glass, wooden shelves displaying finished pale sea-green and aquamarine recycled glassware, plastic crates with empty glass bottles awaiting melting in the corner, natural daylight mingling with furnace glow, authentic industrial craft workshop, no text, no signs` + Phủ định chung.

9. **`vuon-uom-cay-nha-minh.webp`** (Vườn ươm Cây Nhà Mình - Thủ Đức)
   - **Tên thô**: `assets-src/content/shops/vuon-uom-cay-nha-minh.png`
   - **Aspect Ratio**: `4:3`
   - **Prompt**:
     `Photograph of a lush plant nursery sheltered beneath black agricultural shade netting in suburban Ho Chi Minh City, neat rows of raised benches holding black seedling trays bursting with young vegetable sprouts, terracotta pots of fragrant Vietnamese basil, mint, and small potted snake plants lining the gravel path, gentle diffused morning daylight, refreshing vibrant green garden setting, no signage, no readable text` + Phủ định chung.

10. **`nong-trai-dat-lanh.webp`** (Nông Trại Đất Lành - Bình Thạnh)
    - **Tên thô**: `assets-src/content/shops/nong-trai-dat-lanh.png`
    - **Aspect Ratio**: `4:3`
    - **Prompt**:
      `A neat corner of a gardening supply warehouse in Saigon, stacks of plain neutral potting soil bags, compacted brown coconut coir bricks stacked squarely, an open woven bag revealing dark roasted rice husks (trau hun) with a metal hand spade resting against it, concrete floor with red terracotta tile border, warm natural outdoor daylight, uncluttered balanced composition, no brand labels, no typography, no text` + Phủ định chung.

11. **`dung-cu-xanh-nam-sai-gon.webp`** (Dụng Cụ Xanh Nam Sài Gòn - Quận 5)
    - **Tên thô**: `assets-src/content/shops/dung-cu-xanh-nam-sai-gon.png`
    - **Aspect Ratio**: `4:3`
    - **Prompt**:
      `Photograph of a small green mechanical and urban gardening workshop inside a Cho Lon alley in District 5, featuring a sturdy plastic bokashi kitchen compost bin equipped with a bottom brass drain spigot, rolls of black drip irrigation tubing, plastic seedling planters, and pruning shears hanging neatly on a wooden tool board, natural daylight from the alleyway, authentic Vietnamese urban workshop, no text, no signs` + Phủ định chung.

12. **`tiem-xa-bong-sinh-thai.webp`** (Tiệm Xà Bông Sinh Thái - Quận 3)
    - **Tên thô**: `assets-src/content/shops/tiem-xa-bong-sinh-thai.png`
    - **Aspect Ratio**: `4:3`
    - **Prompt**:
      `Close-up eye-level view of a wooden display table in an eco-friendly shop in Ho Chi Minh City: clear glass bottles containing amber-colored soapberry liquid cleaner, a small woven bamboo basket filled with wrinkled brown dried soapberries (bo hon), tied bundles of fresh lemongrass stalks, a dried coconut, and artisanal square bars of golden turmeric soap wrapped with plain twine, warm soft natural lighting, authentic Vietnamese herbal apothecary feel, no text, no labels` + Phủ định chung.

13. **`vuon-pho-xanh-ri.webp`** (Vườn Phố Xanh Rì - Tân Bình)
    - **Tên thô**: `assets-src/content/shops/vuon-pho-xanh-ri.png`
    - **Aspect Ratio**: `4:3`
    - **Prompt**:
      `Photograph of a thriving rooftop vegetable garden on a typical Ho Chi Minh City townhouse, tiered A-frame metal planting racks holding green plastic planter boxes overflowing with fresh water spinach (rau muong) and mustard greens, a lush climbing Malabar spinach trellis with black shade netting overhead, panoramic background showing neighboring Saigon townhouse rooftops and water tanks under bright morning daylight, no readable text` + Phủ định chung.

---

### 3.3 Nhóm Đồ Trao Đổi: `public/content/swap/` (1000×750, AspectRatio: '4:3')

14. **`mau-1.webp`** (Ảnh mẫu: Chồng sách cũ)
    - **Tên thô**: `assets-src/content/swap/mau-1.png`
    - **Aspect Ratio**: `4:3`
    - **Prompt**:
      `Realistic smartphone-style photo of a neat vertical stack of five gently worn Vietnamese paperback books, showing slightly weathered spines and yellowing paper edges, book covers in muted pastel colors with unreadable blurred graphics, resting on traditional patterned cement floor tiles of a Saigon townhouse, natural daylight coming from an open balcony door, authentic secondhand item listing photo, no readable text, no clear letters` + Phủ định chung.

15. **`mau-2.webp`** (Ảnh mẫu: Áo quần gấp gọn)
    - **Tên thô**: `assets-src/content/swap/mau-2.png`
    - **Aspect Ratio**: `4:3`
    - **Prompt**:
      `Casual smartphone snapshot of two neat stacks of folded clean everyday clothes (cotton t-shirts and linen trousers in neutral earthy tones) placed on a light-colored cotton bed sheet with a woven bamboo mat partially visible, natural indoor morning light from an adjacent window, realistic home secondhand donation listing photo, centered composition, no logos, no text` + Phủ định chung.

16. **`mau-3.webp`** (Ảnh mẫu: Nồi chảo gia dụng)
    - **Tên thô**: `assets-src/content/swap/mau-3.png`
    - **Aspect Ratio**: `4:3`
    - **Prompt**:
      `Realistic smartphone photo of everyday Vietnamese kitchen cookware: one medium stainless steel cooking pot with lid and one clean black non-stick frying pan, neatly nested together on a granite kitchen countertop, clean wiped surfaces with slight signs of honest domestic use, natural kitchen window lighting, honest user listing for community exchange, no logos, no brand writing` + Phủ định chung.

17. **`mau-4.webp`** (Ảnh mẫu: Đồ chơi trẻ em)
    - **Tên thô**: `assets-src/content/swap/mau-4.png`
    - **Aspect Ratio**: `4:3`
    - **Prompt**:
      `Smartphone snapshot of a small bright plastic basket placed on a tiled floor, containing a mix of gently used children toys: small colorful toy cars, simple wooden building blocks, and a small plush teddy bear, soft ambient indoor daylight, realistic parents giveaway listing photo, no licensed copyrighted characters, no Disney, no Lego logos, no text` + Phủ định chung.

18. **`s-ao-khoac-jean.webp`** (Áo khoác jean nam size L)
    - **Tên thô**: `assets-src/content/swap/s-ao-khoac-jean.png`
    - **Aspect Ratio**: `4:3`
    - **Prompt**:
      `Top-down smartphone photo of a single men classic blue denim jacket laid completely flat on a light patterned bedspread, buttoned up with collar neatly spread out and metal buttons visible, sleeves straight at the sides, natural daylight from a bedroom window, authentic community swap item photograph, no brand tags with text, no logos, no graphics` + Phủ định chung.

19. **`s-sach-giao-khoa-lop-5.webp`** (Trọn bộ sách giáo khoa lớp 5)
    - **Tên thô**: `assets-src/content/swap/s-sach-giao-khoa-lop-5.png`
    - **Aspect Ratio**: `4:3`
    - **Prompt**:
      `Smartphone photo of a tidy stack of Vietnamese elementary school textbooks and lined notebooks tied together with white plastic raffia twine, colorful illustrated covers with completely blurred unreadable titles, accompanied by two yellow wooden pencils resting on top, placed on a wooden student desk next to a window, authentic family donation photo, no readable text, no letters` + Phủ định chung.

20. **`s-noi-com-dien.webp`** (Nồi cơm điện 1,8 lít)
    - **Tên thô**: `assets-src/content/swap/s-noi-com-dien.png`
    - **Aspect Ratio**: `4:3`
    - **Prompt**:
      `Smartphone-style listing photograph of a standard 1.8-liter hinged-lid electric rice cooker commonly found in Vietnamese households, white body with subtle faded floral decal, power cord neatly coiled beside it, resting on a clean tiled kitchen table, natural domestic daytime lighting, honest secondhand condition, no brand name, no logo, no letters` + Phủ định chung.

21. **`s-xe-day-em-be.webp`** (Xe đẩy em bé gấp gọn)
    - **Tên thô**: `assets-src/content/swap/s-xe-day-em-be.png`
    - **Aspect Ratio**: `4:3`
    - **Prompt**:
      `Smartphone photo of a compact lightweight baby stroller with sun canopy, completely folded up and standing upright against a white wall in the living room hallway of a Vietnamese townhouse, ceramic floor tiles, natural ambient light, authentic pre-owned baby gear swap listing photo, no brand logos, no text` + Phủ định chung.

22. **`s-vay-cong-so.webp`** (3 váy công sở size M)
    - **Tên thô**: `assets-src/content/swap/s-vay-cong-so.png`
    - **Aspect Ratio**: `4:3`
    - **Prompt**:
      `Top-down smartphone photograph of three elegant women work dresses (one black, one navy blue, one beige) neatly laid out side by side on a tidy bed, clean tailored cuts suitable for office wear, one dress has a blank unprinted white paper price tag attached, soft daylight, realistic secondhand clothing exchange photo, no brand labels, no text` + Phủ định chung.

23. **`s-truyen-tranh.webp`** (Thùng truyện tranh cũ khoảng 60 cuốn)
    - **Tên thô**: `assets-src/content/swap/s-truyen-tranh.png`
    - **Aspect Ratio**: `4:3`
    - **Prompt**:
      `Eye-level smartphone photo of an open brown cardboard box filled with rows of small-format vintage comic books standing upright, colorful book spines visible with aged off-white paper edges, placed on a tiled floor in a Saigon room, natural window lighting, honest donation listing, completely unreadable blurred spine text, no copyrighted characters, no Dragon Ball, no Conan, no text` + Phủ định chung.

24. **`s-bo-chen-bat.webp`** (Bộ chén bát sứ 12 món)
    - **Tên thô**: `assets-src/content/swap/s-bo-chen-bat.png`
    - **Aspect Ratio**: `4:3`
    - **Prompt**:
      `Smartphone listing photo of a 12-piece classic Vietnamese white ceramic dining tableware set neatly arranged on a wooden table: small stacks of rice bowls, soup bowls, round dinner plates, and an oval serving dish, accompanied by sheets of old crumpled unprinted newspaper used for wrapping, natural domestic lighting, no logos, no printed patterns, no readable text` + Phủ định chung.

25. **`s-lego-hop.webp`** (Hộp đồ chơi lắp ráp khoảng 300 miếng)
    - **Tên thô**: `assets-src/content/swap/s-lego-hop.png`
    - **Aspect Ratio**: `4:3`
    - **Prompt**:
      `Smartphone photo of a clear plastic storage container filled with assorted colorful generic plastic building toy bricks, beside it sit two small completed amateur builds (a tiny colorful house and a simple four-wheeled car), placed on a light wooden floor, bright natural indoor lighting, no Lego logo, no brand marks, no copyrighted characters, no text` + Phủ định chung.

---

### 3.4 Nhóm Sản Phẩm Ve Chai Phế Liệu: `public/content/products/` (1200×900, AspectRatio: '4:3')

26. **`giay-vun.webp`** (Khóa `IMAGES.paper`: Giấy & Bìa carton)
    - **Tên thô**: `assets-src/content/products/giay-vun.png`
    - **Aspect Ratio**: `4:3`
    - **Prompt**:
      `Documentary photograph of sorted recyclable waste paper at a scrap collection yard in Saigon: neat separate stacks of shredded office paper, tied bundles of old books, and flattened cartons piled on a concrete floor, bright diffuse daylight, realistic municipal recycling depot setting, clearly distinct from compressed bales, no readable text, no clear lettering` + Phủ định chung.

27. **`nhua-cac-loai.webp`** (Khóa `IMAGES.plastic`: Nhựa tái chế)
    - **Tên thô**: `assets-src/content/products/nhua-cac-loai.png`
    - **Aspect Ratio**: `4:3`
    - **Prompt**:
      `A large woven polypropylene bulk sack standing open in a Ho Chi Minh City scrapyard, overflowing with mixed discarded rigid household plastics: broken colorful plastic washbasins, empty plastic jerrycans, cracked plastic buckets, and old plastic baskets, textured industrial ground, natural daytime lighting, realistic scrap recyclable material, no brand logos, no readable text` + Phủ định chung.

28. **`chai-lo-thuy-tinh.webp`** (Khóa `IMAGES.glass`: Chai lọ thủy tinh)
    - **Tên thô**: `assets-src/content/products/chai-lo-thuy-tinh.png`
    - **Aspect Ratio**: `4:3`
    - **Prompt**:
      `Photograph of cleaned and sorted empty glass bottles and jars stored in a sturdy cardboard box at a Vietnamese collection center: brown beer bottles, clear fish sauce glass bottles, and round preserve jars with all labels peeled off completely, transparent and amber glass catching natural sunlight, clean and organized, no paper labels, no brand names, no text` + Phủ định chung.

29. **`do-dien-tu-cu.webp`** (Khóa `IMAGES.electronic`: Đồ điện tử cũ)
    - **Tên thô**: `assets-src/content/products/do-dien-tu-cu.png`
    - **Aspect Ratio**: `4:3`
    - **Prompt**:
      `Photograph of a shallow cardboard box containing discarded home consumer electronics gathered for scrap recycling: an old keypad mobile phone, television remote controls, tangled black charger cables, power adapters, and a detached electronic circuit board, placed on concrete pavement, natural outdoor daylight, realistic e-waste collection, no brand logos, no text` + Phủ định chung.

30. **`do-gia-dung-thanh-ly.webp`** (Khóa `IMAGES.furniture`: Đồ gia dụng thanh lý)
    - **Tên thô**: `assets-src/content/products/do-gia-dung-thanh-ly.png`
    - **Aspect Ratio**: `4:3`
    - **Prompt**:
      `Documentary photo of a front courtyard of a Saigon townhouse displaying second-hand domestic items for clearance: a small wooden two-door cabinet, a stack of two red plastic chairs, an old electric pedestal fan, and metal cooking pots standing on terracotta tiled ground, bright morning sunlight, authentic house moving clearance scene, no brand logos, no text` + Phủ định chung.

31. **`carton-ep-kien.webp`** (Khóa `IMAGES.cardboard`: Bìa carton ép kiện)
    - **Tên thô**: `assets-src/content/products/carton-ep-kien.png`
    - **Aspect Ratio**: `4:3`
    - **Prompt**:
      `Photograph of heavy rectangular compressed bales of corrugated cardboard, tightly strapped with industrial steel wire bands, neatly stacked in a Saigon paper recycling warehouse, clear kraft brown cardboard textures and corrugated cross-sections, industrial daylight from high windows, no printed words on cardboard, no logo, no text` + Phủ định chung.

32. **`chai-pet.webp`** (Khóa `IMAGES.petBottles`: Chai nhựa PET)
    - **Tên thô**: `assets-src/content/products/chai-pet.png`
    - **Aspect Ratio**: `4:3`
    - **Prompt**:
      `Photograph of a large mesh nylon sack bursting with sorted transparent PET plastic beverage bottles, all completely crushed flat with bottle caps and labels thoroughly removed, clean translucent plastic reflecting natural sunlight in a scrapyard courtyard, tidy recyclable materials, no brand logos, no labels, no text` + Phủ định chung.

33. **`lon-nhom.webp`** (Khóa `IMAGES.aluminum`: Lon nhôm đã phân loại)
    - **Tên thô**: `assets-src/content/products/lon-nhom.png`
    - **Aspect Ratio**: `4:3`
    - **Prompt**:
      `Photograph of a large plastic tub filled with thousands of cleanly crushed aluminum beverage cans, metallic silver aluminum sheen with faded generic colorful patterns, flattened neatly for recycling, natural bright outdoor daylight in a collection depot, no legible brand names, no readable text, no Heineken or Coca-Cola logos` + Phủ định chung.

34. **`quat-cay-cu.webp`** (Khóa `IMAGES.fan`: Máy quạt cây cũ)
    - **Tên thô**: `assets-src/content/products/quat-cay-cu.png`
    - **Aspect Ratio**: `4:3`
    - **Prompt**:
      `Photograph of an ordinary plastic standing pedestal electric fan (pale gray or off-white) common in Vietnamese homes, wire metal grille guard, mechanical speed buttons on the plastic pole, standing on a tiled floor in a living room, natural window lighting, honest working used item listing, no brand badge, no logo, no text` + Phủ định chung.

35. **`ban-go-cu.webp`** (Khóa `IMAGES.woodenTable`: Bàn gỗ cũ)
    - **Tên thô**: `assets-src/content/products/ban-go-cu.png`
    - **Aspect Ratio**: `4:3`
    - **Prompt**:
      `Photograph of a simple rectangular four-legged solid wood study table (about 120cm x 60cm), natural warm wood grain with honest minor surface scuffs and character, sturdy carpentry structure, standing on a balcony with potted plants in the background, warm natural daylight, pre-owned furniture sale listing, no manufacturer logo, no text` + Phủ định chung.

36. **`giay-bao-cu.webp`** (Khóa `IMAGES.newspaper`: Giấy báo cũ)
    - **Tên thô**: `assets-src/content/products/giay-bao-cu.png`
    - **Aspect Ratio**: `4:3`
    - **Prompt**:
      `Photograph of several thick bundles of old daily newspapers neatly tied with green plastic twine in a cross pattern, resting directly beside an iconic Vietnamese mechanical spring scale (green metal dial scale with clock-face dial), set on concrete pavement, bright natural daylight, unreadable blurred newspaper print, no readable headlines, no text` + Phủ định chung.

37. **`chai-thuy-tinh-nguyen.webp`** (Khóa `IMAGES.glassBottles`: Chai thủy tinh nguyên vẹn)
    - **Tên thô**: `assets-src/content/products/chai-thuy-tinh-nguyen.png`
    - **Aspect Ratio**: `4:3`
    - **Prompt**:
      `Photograph of a sturdy red plastic beverage crate filled neatly with intact, empty brown and green glass beer bottles standing in rows, completely clean with all paper labels peeled off, sitting in the courtyard of a Saigon scrap collection station, warm sunlight gleaming off glass surfaces, no brand labels, no text` + Phủ định chung.

38. **`may-tinh-ban-cu.webp`** (Khóa `IMAGES.oldPC`: Máy vi tính bàn cũ)
    - **Tên thô**: `assets-src/content/products/may-tinh-ban-cu.png`
    - **Aspect Ratio**: `4:3`
    - **Prompt**:
      `Photograph of an older used desktop computer set arranged on a wooden desk: a black mid-tower CPU case, a flat-screen LCD monitor (approx. 20 inches) with black bezel, wired USB keyboard, and mouse, clean second-hand electronics equipment in a home office, screen is turned off showing dark reflection, no brand logos, no text` + Phủ định chung.

39. **`ghe-go.webp`** (Khóa `IMAGES.woodenChair`: Ghế gỗ thanh lý)
    - **Tên thô**: `assets-src/content/products/ghe-go.png`
    - **Aspect Ratio**: `4:3`
    - **Prompt**:
      `Photograph of two sturdy matching wooden dining chairs with vertical slat backs, warm honey-brown wood finish in great 80% condition, arranged side by side on patterned cement floor tiles in a Vietnamese home, soft natural morning daylight from a doorway, honest pre-owned furniture listing, clearly chairs and not a table, no brand tags, no text` + Phủ định chung.

---

## PHẦN 4: MÃ NGUỒN VÀ DỮ LIỆU ĐỒNG BỘ CHO CÁC TỆP CỐT LÕI

### 4.1 Cập nhật `src/data/mock-data.ts` (Chỉ sửa object `IMAGES`)
Thay thế dòng 4–20 trong [`src/data/mock-data.ts`](file:///c:/123/src/data/mock-data.ts#L4-L20) thành đoạn mã chuẩn xác 100% đường dẫn nội bộ:

```ts
export const IMAGES = {
  paper: "/content/products/giay-vun.webp",
  plastic: "/content/products/nhua-cac-loai.webp",
  metal: "/content/products/sat-vun.webp",
  glass: "/content/products/chai-lo-thuy-tinh.webp",
  electronic: "/content/products/do-dien-tu-cu.webp",
  furniture: "/content/products/do-gia-dung-thanh-ly.webp",
  cardboard: "/content/products/carton-ep-kien.webp",
  petBottles: "/content/products/chai-pet.webp",
  aluminum: "/content/products/lon-nhom.webp",
  fan: "/content/products/quat-cay-cu.webp",
  woodenTable: "/content/products/ban-go-cu.webp",
  newspaper: "/content/products/giay-bao-cu.webp",
  glassBottles: "/content/products/chai-thuy-tinh-nguyen.webp",
  oldPC: "/content/products/may-tinh-ban-cu.webp",
  woodenChair: "/content/products/ghe-go.webp",
} as const;
```

---

### 4.2 Cập nhật tệp `public/content/NGUON-ANH.md` (Toàn bộ 51 dòng đúng sự thật)
Ghi đè nội dung tệp [`public/content/NGUON-ANH.md`](file:///c:/123/public/content/NGUON-ANH.md) theo mẫu chuẩn xác sau:

```markdown
# Nhật ký nguồn ảnh nội dung Green City

Ghi nhận trung thực 100% nguồn gốc, tình trạng và mô tả thực tế của từng ảnh nội dung trong dự án Green City.

## 1. Danh sách 51 ảnh nội dung

| File | Loại | Nguồn | Tác giả | Giấy phép | Ảnh thực tế cho thấy gì |
|---|---|---|---|---|---|
| learn/phan-loai-rac-tai-nha.webp | Tự tạo (AI) | Antigravity (gemini-3.1-flash-image) | – | Tự tạo cho Green City | Góc bếp nhà phố Việt Nam tường gạch bông, dưới bồn rửa có 3 thùng rác nắp màu (xanh lá rác rau củ, xanh dương chai lọ, xám rác còn lại). |
| learn/chuan-bi-ve-chai-ban-duoc-gia.webp | Tự tạo (AI) | Antigravity (gemini-3.1-flash-image) | – | Tự tạo cho Green City | Sân gạch tàu nhà phố: bao tải dứa đựng chai nhựa bóc nhãn ép dẹp, rổ nhựa đan đựng lon nhôm đạp dẹt, chồng bìa carton gấp phẳng buộc dây xanh. |
| learn/u-phan-huu-co-thung-xop.webp | Tự tạo (AI) | Antigravity (gemini-3.1-flash-image) | – | Tự tạo cho Green City | Phụ nữ đội nón lá xới đất rác bếp trong thùng xốp trắng trên sân thượng nhìn ra phố xá Sài Gòn, bên cạnh có chậu cây cảnh. |
| learn/u-vo-trai-cay-nuoc-ngam-enzyme.webp | Tự tạo (AI) | Antigravity (gemini-3.1-flash-image) | – | Tự tạo cho Green City | Bình thủy tinh lớn ngâm vỏ dứa, vỏ cam quýt trong nước enzyme hổ phách, chén gốm đựng đường nâu trên bàn gỗ bếp. |
| learn/di-cho-it-tui-nilon.webp | Tự tạo (AI) | Antigravity (gemini-3.1-flash-image) | – | Tự tạo cho Green City | Sạp rau chợ truyền thống Việt Nam, mẹt tre đựng rau muống tươi và cà chua, tay người mua mở giỏ cói đan, có hộp nhựa nắp kín. |
| learn/pin-bong-den-thuoc-het-han.webp | Tự tạo (AI) | Antigravity (gemini-3.1-flash-image) | – | Tự tạo cho Green City | Mặt bàn gỗ mộc với 3 nhóm rác nguy hại riêng biệt: hũ nhựa đựng pin cũ, bóng đèn tháo rời, hộp carton đựng vỉ và lọ thuốc cũ. |
| learn/vong-doi-moi-cho-quan-ao-cu.webp | Tự tạo (AI) | Antigravity (gemini-3.1-flash-image) | – | Tự tạo cho Green City | Phòng ngủ nhà phố Việt lát gạch bông, phụ nữ ngồi xếp áo quần vào thùng carton, cạnh đó có chồng áo gấp gọn và chồng sách cũ buộc dây. |
| learn/sua-do-gia-dung-truoc-khi-vut.webp | Tự tạo (AI) | Antigravity (gemini-3.1-flash-image) | – | Tự tạo cho Green City | Thợ sửa đồ điện trong hẻm Sài Gòn tháo cụm mô-tơ quạt bàn nhựa xanh bằng tua vít, bàn có đồng hồ đo điện, mỏ hàn, kìm cắt. |
| rewards/phan-huu-co-2kg.webp | Tự tạo (AI) | Antigravity (gemini-3.1-flash-image) | – | Tự tạo cho Green City | Túi giấy kraft trơn mở miệng đựng phân hữu cơ nâu sẫm tơi xốp, bên cạnh có muỗng gỗ nhỏ trên mặt bàn gỗ phong cách shop online. |
| rewards/phan-trun-que-1kg.webp | Tự tạo (AI) | Antigravity (gemini-3.1-flash-image) | – | Tự tạo cho Green City | Túi zip trong suốt đứng thẳng đựng phân trùn quế đen mịn, một ít phân rắc ra bàn kèm vài lá cây nhỏ trang trí. |
| rewards/tui-vai-di-cho.webp | Tự tạo (AI) | Antigravity (gemini-3.1-flash-image) | – | Tự tạo cho Green City | Túi vải canvas màu mộc đứng thẳng trên bàn gỗ, bên trong ló rau muống và chanh xanh, cạnh đó có túi vải cùng loại gấp phẳng. |
| rewards/chau-luoi-ho.webp | Tự tạo (AI) | Antigravity (gemini-3.1-flash-image) | – | Tự tạo cho Green City | Cây lưỡi hổ cao 25cm trồng trong chậu đất nung màu cam đỏ có đĩa lót, đặt trên bàn gỗ sáng trước tường be nhạt. |
| rewards/dung-cu-lam-vuon-mini.webp | Tự tạo (AI) | Antigravity (gemini-3.1-flash-image) | – | Tự tạo cho Green City | Bộ 3 dụng cụ: xẻng nhỏ cán gỗ, cào 3 răng cán gỗ và bình tưới kim loại 1L xanh lá, cạnh chậu đất nhỏ trên bàn gỗ. |
| rewards/ly-thuy-tinh-tai-che.webp | Tự tạo (AI) | Antigravity (gemini-3.1-flash-image) | – | Tự tạo cho Green City | Ly thủy tinh tái chế dày dặn màu xanh ngọc nhạt có bọt khí nhỏ tự nhiên, đựng trà đá trên bàn gỗ mộc. |
| rewards/ong-hut-inox.webp | Tự tạo (AI) | Antigravity (gemini-3.1-flash-image) | – | Tự tạo cho Green City | Bộ 4 ống hút inox (2 thẳng, 2 cong), 1 cọ rửa, túi vải rút nhỏ và ly nước chanh tươi trên khăn vải bố. |
| rewards/tui-luoi-dung-rau.webp | Tự tạo (AI) | Antigravity (gemini-3.1-flash-image) | – | Tự tạo cho Green City | 3 túi lưới cotton màu mộc có dây rút cỡ lớn, vừa, nhỏ đựng cà chua, đậu bắp và xà lách trên bàn gỗ. |
| shops/phan-huu-co-ba-la.webp | Tự tạo (AI) | Antigravity (gemini-3.1-flash-image) | – | Tự tạo cho Green City | Nhà xưởng mái tôn, các luống phân hữu cơ đang ủ, bao phân xếp chồng, xe rùa và công nhân đội nón lá đang làm việc. |
| shops/tiem-gon-gang-xanh.webp | Tự tạo (AI) | Antigravity (gemini-3.1-flash-image) | – | Tự tạo cho Green City | Cửa tiệm nhỏ ấm cúng trong nhà phố, kệ gỗ bày túi canvas, bình giữ nhiệt inox, bàn chải tre và màng bọc sáp ong. |
| shops/xuong-thuy-tinh-tai-sinh.webp | Tự tạo (AI) | Antigravity (gemini-3.1-flash-image) | – | Tự tạo cho Green City | Xưởng thổi thủy tinh thủ công: lò nung đỏ rực, thợ cầm ống thổi, kệ ly cốc màu xanh ngọc và sọt chai cũ chờ nấu. |
| shops/vuon-uom-cay-nha-minh.webp | Tự tạo (AI) | Antigravity (gemini-3.1-flash-image) | – | Tự tạo cho Green City | Vườn ươm dưới lưới che nắng đen ở Thủ Đức, các khay ươm cây rau xanh tốt, chậu thảo mộc húng quế, bạc hà và lưỡi hổ. |
| shops/nong-trai-dat-lanh.webp | Tự tạo (AI) | Antigravity (gemini-3.1-flash-image) | – | Tự tạo cho Green City | Kho sân nhà phố chất các bao đất trồng cây trơn, bánh xơ dừa ép khối, bao trấu hun đen mở miệng và xẻng làm vườn. |
| shops/dung-cu-xanh-nam-sai-gon.webp | Tự tạo (AI) | Antigravity (gemini-3.1-flash-image) | – | Tự tạo cho Green City | Tiệm cơ khí nhỏ trong hẻm Chợ Lớn: thùng ủ rác bokashi có vòi xả đáy, cuộn ống tưới nhỏ giọt, khay nhựa trồng rau. |
| shops/tiem-xa-bong-sinh-thai.webp | Tự tạo (AI) | Antigravity (gemini-3.1-flash-image) | – | Tự tạo cho Green City | Kệ gỗ bày chai thủy tinh nước bồ hòn hổ phách, rổ quả bồ hòn khô, bó sả, trái dừa và các bánh xà bông vàng nghệ. |
| shops/vuon-pho-xanh-ri.webp | Tự tạo (AI) | Antigravity (gemini-3.1-flash-image) | – | Tự tạo cho Green City | Sân thượng nhà phố Tân Bình: kệ sắt chữ A trồng rau muống, cải ngọt, giàn mồng tơi leo, lưới che nắng nhìn ra mái nhà phố. |
| swap/mau-1.webp | Tự tạo (AI) | Antigravity (gemini-3.1-flash-image) | – | Tự tạo cho Green City | Chồng 5 cuốn sách cũ tiếng Việt bìa mờ không chữ đọc được, gáy sờn nhẹ, đặt trên nền gạch bông nhà phố. |
| swap/mau-2.webp | Tự tạo (AI) | Antigravity (gemini-3.1-flash-image) | – | Tự tạo cho Green City | 2 chồng áo quần thường ngày đã giặt sạch và gấp gọn gàng, đặt trên ga giường cạnh chiếu trúc trong phòng ngủ. |
| swap/mau-3.webp | Tự tạo (AI) | Antigravity (gemini-3.1-flash-image) | – | Tự tạo cho Green City | Nồi inox gia đình và chảo chống dính đã cọ rửa sạch sẽ, xếp chồng gọn gàng trên mặt bàn bếp đá hoa cương. |
| swap/mau-4.webp | Tự tạo (AI) | Antigravity (gemini-3.1-flash-image) | – | Tự tạo cho Green City | Rổ nhựa nhỏ chứa đồ chơi trẻ em cũ: ô tô đồ chơi nhỏ, khối gỗ ghép hình, gấu bông mini trên nền nhà. |
| swap/s-ao-khoac-jean.webp | Tự tạo (AI) | Antigravity (gemini-3.1-flash-image) | – | Tự tạo cho Green City | Một áo khoác jean nam màu xanh denim trải phẳng trên giường, thấy rõ cổ bẻ và hàng nút kim loại, không logo. |
| swap/s-sach-giao-khoa-lop-5.webp | Tự tạo (AI) | Antigravity (gemini-3.1-flash-image) | – | Tự tạo cho Green City | Chồng sách giáo khoa tiểu học và vở ô ly bìa màu mờ không chữ đọc được, kèm 2 bút chì, buộc gọn bằng dây nilon. |
| swap/s-noi-com-dien.webp | Tự tạo (AI) | Antigravity (gemini-3.1-flash-image) | – | Tự tạo cho Green City | Nồi cơm điện nắp gài gia đình kiểu Việt dung tích 1,8L màu trắng có hoa văn nhạt, dây cuộn gọn, đặt trên bàn bếp. |
| swap/s-xe-day-em-be.webp | Tự tạo (AI) | Antigravity (gemini-3.1-flash-image) | – | Tự tạo cho Green City | Xe đẩy em bé có mái che màu xám đã gấp gọn dựng sát tường ở hành lang nhà phố lát gạch men. |
| swap/s-vay-cong-so.webp | Tự tạo (AI) | Antigravity (gemini-3.1-flash-image) | – | Tự tạo cho Green City | 3 chiếc váy công sở (đen, xanh navy, be) trải phẳng trên giường, một chiếc có mác giấy trắng trơn không chữ. |
| swap/s-truyen-tranh.webp | Tự tạo (AI) | Antigravity (gemini-3.1-flash-image) | – | Tự tạo cho Green City | Thùng carton mở nắp chứa đầy truyện tranh khổ nhỏ xếp đứng, giấy ngả vàng mộc mạc, không nhân vật bản quyền. |
| swap/s-bo-chen-bat.webp | Tự tạo (AI) | Antigravity (gemini-3.1-flash-image) | – | Tự tạo cho Green City | Bộ chén bát sứ trắng (chén cơm, tô canh, đĩa tròn) xếp chồng trên bàn gỗ cạnh giấy báo cũ lót gói đồ. |
| swap/s-lego-hop.webp | Tự tạo (AI) | Antigravity (gemini-3.1-flash-image) | – | Tự tạo cho Green City | Hộp nhựa trong chứa các khối gạch lắp ráp nhiều màu sắc, cạnh 2 mô hình ngôi nhà và xe nhỏ tự lắp ráp. |
| products/giay-vun.webp | Tự tạo (AI) | Antigravity (gemini-3.1-flash-image) | – | Tự tạo cho Green City | Các đống giấy vụn văn phòng, sách báo cũ đã phân loại và buộc bó gọn gàng trên sàn xi măng vựa ve chai Sài Gòn. |
| products/nhua-cac-loai.webp | Tự tạo (AI) | Antigravity (gemini-3.1-flash-image) | – | Tự tạo cho Green City | Bao tải dứa to chứa đầy nhựa gia dụng các loại: thau chậu vỡ, can nhựa trắng, rổ nhựa cũ ở góc sân vựa phế liệu. |
| products/sat-vun.webp | Tự tạo (AI) | Antigravity (gemini-3.1-flash-image) | – | Tự tạo cho Green City | Đống sắt vụn trong nhà xưởng: ống sắt, vành xe cũ, thanh kim loại, sắt rỉ chất đống trên nền xưởng. |
| products/chai-lo-thuy-tinh.webp | Tự tạo (AI) | Antigravity (gemini-3.1-flash-image) | – | Tự tạo cho Green City | Chai lọ thủy tinh các loại đã rửa sạch phơi khô: hũ mứt, chai nước mắm, chai bia bóc sạch nhãn mác trong thùng carton. |
| products/do-dien-tu-cu.webp | Tự tạo (AI) | Antigravity (gemini-3.1-flash-image) | – | Tự tạo cho Green City | Thùng carton chứa đồ điện tử cũ thanh lý: điện thoại phím cũ, remote tivi, củ sạc, dây cáp điện cuộn tròn. |
| products/do-gia-dung-thanh-ly.webp | Tự tạo (AI) | Antigravity (gemini-3.1-flash-image) | – | Tự tạo cho Green City | Góc sân trước nhà phố TP.HCM bày đồ gia dụng thanh lý: tủ gỗ nhỏ 2 cánh, ghế nhựa đỏ xếp chồng, quạt cũ, xoong nồi. |
| products/carton-ep-kien.webp | Tự tạo (AI) | Antigravity (gemini-3.1-flash-image) | – | Tự tạo cho Green City | Các kiện bìa carton đã ép thủy lực vuông vức, siết chặt bằng dây đai thép chất thành đống trong vựa phế liệu. |
| products/chai-pet.webp | Tự tạo (AI) | Antigravity (gemini-3.1-flash-image) | – | Tự tạo cho Green City | Bao tải dứa đầy chai nhựa PET trong suốt, toàn bộ đã bóc nhãn và giẫm ép dẹp sạch sẽ, ánh sáng ban ngày. |
| products/lon-nhom.webp | Tự tạo (AI) | Antigravity (gemini-3.1-flash-image) | – | Tự tạo cho Green City | Sọt nhựa đầy lon bia lon nước ngọt bằng nhôm đã đạp dẹp phẳng màu kim loại sáng, không có nhãn hiệu đọc được. |
| products/quat-cay-cu.webp | Tự tạo (AI) | Antigravity (gemini-3.1-flash-image) | – | Tự tạo cho Green City | Quạt đứng thân nhựa màu xám trắng gia đình Việt Nam quen thuộc, lồng quạt kim loại, 3 nút bấm cơ học trên sàn nhà. |
| products/ban-go-cu.webp | Tự tạo (AI) | Antigravity (gemini-3.1-flash-image) | – | Tự tạo cho Green City | Chiếc bàn làm việc 4 chân bằng gỗ tự nhiên mặt trầy xước nhẹ còn rất chắc chắn đặt ở ban công góc nhà phố. |
| products/giay-bao-cu.webp | Tự tạo (AI) | Antigravity (gemini-3.1-flash-image) | – | Tự tạo cho Green City | Chồng báo cũ giấy xốp buộc dây nilon chữ thập đặt cạnh chiếc cân đồng hồ lò xo Nhơn Hòa màu xanh lá cây. |
| products/chai-thuy-tinh-nguyen.webp | Tự tạo (AI) | Antigravity (gemini-3.1-flash-image) | – | Tự tạo cho Green City | Sọt nhựa công nghiệp màu đỏ chứa đầy các chai bia thủy tinh màu nâu và xanh lá còn nguyên vẹn, không nhãn mác. |
| products/may-tinh-ban-cu.webp | Tự tạo (AI) | Antigravity (gemini-3.1-flash-image) | – | Tự tạo cho Green City | Bộ máy vi tính để bàn cũ: thùng case CPU đứng màu đen, màn hình LCD 20 inch, bàn phím và chuột có dây trên bàn. |
| products/ghe-go.webp | Tự tạo (AI) | Antigravity (gemini-3.1-flash-image) | – | Tự tạo cho Green City | 2 chiếc ghế tựa bằng gỗ tự nhiên nan lưng dọc màu nâu ấm còn chắc chắn đặt trên nền gạch bông phòng khách. |

## 2. Prompt rút gọn của toàn bộ 51 ảnh tự tạo

- `learn/phan-loai-rac-tai-nha`: Realistic photo, Ho Chi Minh City townhouse kitchen corner, 3 bins under sink with green, blue, grey plain lids for sorting, patterned tiles, no readable text.
- `learn/chuan-bi-ve-chai-ban-duoc-gia`: Terracotta tile courtyard, crushed plastic bottles in woven sack, crushed cans in plastic basket, flattened cardboard tied with string, tidy daylight.
- `learn/u-phan-huu-co-thung-xop`: Townhouse rooftop overlooking Saigon, open white styrofoam box with kitchen compost, gardener in conical hat turning soil with trowel, potted plant.
- `learn/u-vo-trai-cay-nuoc-ngam-enzyme`: Wide-mouth glass jar on wooden kitchen table with fermenting pineapple and citrus peel eco-enzyme liquid, bowl of brown sugar beside.
- `learn/di-cho-it-tui-nilon`: Traditional Vietnamese wet market stall, fresh morning glory and tomatoes in bamboo baskets, shopper holding woven straw bag, reusable container on stall.
- `learn/pin-bong-den-thuoc-het-han`: Wooden table, 3 distinct groups: clear plastic jar with used batteries, old light bulbs, unprinted cardboard box with blister medicine packs.
- `learn/vong-doi-moi-cho-quan-ao-cu`: Townhouse bedroom with encaustic cement tiles, woman packing clothes into donation cardboard box, folded clothes stack, tied old books bundle.
- `learn/sua-do-gia-dung-truoc-khi-vut`: Electronics repair workbench in Saigon alley, hands disassembling plastic fan motor with screwdriver, multimeter, soldering iron.
- `rewards/phan-huu-co-2kg`: Product shot on light wooden table, unprinted kraft paper bag filled with loose brown compost, small wooden scoop beside, bright soft studio light.
- `rewards/phan-trun-que-1kg`: Product shot on wood table, standing transparent ziploc pouch filled with fine black vermicompost, sprinkled granules with tiny leaves.
- `rewards/tui-vai-di-cho`: Product shot on wood table, unbleached canvas tote standing with fresh greens and limes peeking out, folded canvas tote lying beside.
- `rewards/chau-luoi-ho`: Studio product shot, 25cm snake plant in reddish-orange unglazed terracotta clay pot, light wooden surface, neutral wall, soft morning daylight, no logo.
- `rewards/dung-cu-lam-vuon-mini`: Product shot on rustic wood, 3-piece mini garden tools: trowel, 3-prong rake with wooden handles, 1L green watering can, tiny soil pot, no text.
- `rewards/ly-thuy-tinh-tai-che`: Product shot, thick recycled glass tumbler with pale aquamarine tint and tiny air bubbles inside glass, filled with iced tea on wooden table, no logo.
- `rewards/ong-hut-inox`: Product flat lay on linen cloth: 2 straight, 2 bent stainless steel straws, 1 cleaning brush, unbleached canvas pouch, glass with lime slices, no text.
- `rewards/tui-luoi-dung-rau`: Product shot, set of 3 cotton mesh produce drawstring bags in 3 sizes with fresh tomatoes, okra, lettuce inside, wooden countertop, no labels.
- `shops/phan-huu-co-ba-la`: Corrugated metal workshop in HCMC, organized compost piles, stacked burlap sacks, wheelbarrow, worker in conical hat turning compost, daylight.
- `shops/tiem-gon-gang-xanh`: Cozy zero-waste shop in Saigon townhouse, wooden shelves with canvas totes, stainless bottles, bamboo brushes, beeswax wraps, soft natural lighting.
- `shops/xuong-thuy-tinh-tai-sinh`: Glassblowing recycling workshop in Saigon, glowing furnace, artisan with blowpipe shaping glass, shelves of aquamarine recycled glassware.
- `shops/vuon-uom-cay-nha-minh`: Plant nursery under black shade mesh in Thu Duc, rows of vegetable seedling trays, terracotta pots of basil, mint, snake plants, diffuse daylight.
- `shops/nong-trai-dat-lanh`: Gardening warehouse corner, stacks of plain soil bags, compressed coir bricks, open bag of dark roasted rice husks with hand spade, concrete floor.
- `shops/dung-cu-xanh-nam-sai-gon`: Urban gardening workshop in Cho Lon alley, plastic bokashi compost bin with spigot, black drip irrigation tubing, seedling trays, shears on board.
- `shops/tiem-xa-bong-sinh-thai`: Eco shop wooden table, amber soapberry cleaner in glass bottles, basket of dried soapberries, lemongrass, coconut, handmade turmeric soap bars.
- `shops/vuon-pho-xanh-ri`: Saigon townhouse rooftop garden, tiered A-frame metal racks with water spinach planters, climbing spinach trellis, shade netting, city roof background.
- `swap/mau-1`: Smartphone photo, vertical stack of 5 worn Vietnamese paperback books with unreadable blurred pastel covers on patterned encaustic tiles, balcony light.
- `swap/mau-2`: Smartphone photo, 2 neat stacks of folded clean everyday clothes on light bed sheet with bamboo mat, natural morning window light, honest listing.
- `swap/mau-3`: Smartphone photo, stainless steel pot and clean black non-stick pan nested together on granite kitchen counter, slight domestic use, natural lighting.
- `swap/mau-4`: Smartphone photo, small plastic basket on tiled floor with used toy cars, wooden building blocks, tiny plush bear, natural ambient light, no licensed characters.
- `swap/s-ao-khoac-jean`: Top-down smartphone photo, men classic blue denim jacket laid flat on light bedspread, buttoned up with collar visible, metal buttons, no brand logos.
- `swap/s-sach-giao-khoa-lop-5`: Smartphone photo, stack of elementary school textbooks and notebooks tied with raffia twine, blurred illustrated covers, two wooden pencils, desk.
- `swap/s-noi-com-dien`: Smartphone listing photo, 1.8L white hinged-lid electric rice cooker with subtle floral decal, coiled power cord on tiled kitchen counter, no brand logo.
- `swap/s-xe-day-em-be`: Smartphone photo, lightweight gray baby stroller with sun canopy completely folded upright against hallway wall in Vietnamese townhouse, tiled floor.
- `swap/s-vay-cong-so`: Top-down smartphone photo, 3 women work dresses (black, navy, beige) laid flat on bed, tailored cut, blank unprinted paper price tag, soft daylight.
- `swap/s-truyen-tranh`: Eye-level smartphone photo, open cardboard box filled with vintage small comic books standing upright, colorful spines, aged paper, no copyrighted characters.
- `swap/s-bo-chen-bat`: Smartphone photo, 12-piece white ceramic tableware set (rice bowls, soup bowls, plates) neatly stacked on wood table with old packing newspaper, no logos.
- `swap/s-lego-hop`: Smartphone photo, clear plastic tub of assorted colorful toy bricks, two small amateur builds (tiny house, simple car) beside, light wooden floor, no logo.
- `products/giay-vun`: Scrapyard concrete floor in Saigon, sorted recyclable waste paper: shredded office paper bundles, old books, flattened cartons, bright daylight, no readable text.
- `products/nhua-cac-loai`: Large woven bulk sack in Saigon scrapyard overflowing with rigid household plastics: broken washbasins, white jerrycans, cracked buckets, natural daylight.
- `products/sat-vun`: Scrap metal pile in Vietnamese workshop, rusty pipes, old iron frames, bicycle rims, scrap metal pieces on concrete floor, natural daylight, no readable text.
- `products/chai-lo-thuy-tinh`: Cleaned sorted empty glass bottles and jars in cardboard box at collection center: beer bottles, fish sauce bottles, jam jars with labels peeled off.
- `products/do-dien-tu-cu`: Shallow cardboard box of discarded home e-waste: old keypad mobile, TV remotes, coiled charger cables, adapter plugs, circuit board on pavement.
- `products/do-gia-dung-thanh-ly`: Townhouse front yard displaying clearance items: small wooden 2-door cabinet, stacked red plastic chairs, pedestal fan, metal pots on tiled floor.
- `products/carton-ep-kien`: Heavy rectangular compressed bales of corrugated cardboard strapped with steel wire bands stacked in recycling warehouse, kraft brown texture, no text.
- `products/chai-pet`: Large mesh sack filled with crushed transparent PET plastic bottles, clean translucent plastic with caps and labels completely removed, daylight.
- `products/lon-nhom`: Plastic crate filled with crushed aluminum beverage cans, metallic silver sheen, flattened for recycling in depot, no readable brand logos.
- `products/quat-cay-cu`: Ordinary light gray plastic pedestal fan, wire metal grille, push buttons on pole, standing on living room tile floor, working condition, no logo.
- `products/ban-go-cu`: Simple 4-legged wooden desk (120x60cm), natural grain with minor scuffs, sturdy carpentry, standing on balcony with plants, warm daylight, no logo.
- `products/giay-bao-cu`: Thick bundles of old newspapers tied with green plastic twine beside a green Nhon Hoa spring dial scale on concrete pavement, blurred unreadable text.
- `products/chai-thuy-tinh-nguyen`: Red plastic crate filled with intact clean brown and green glass beer bottles standing in rows, no paper labels, scrapyard courtyard.
- `products/may-tinh-ban-cu`: Older desktop computer set on wood desk: black tower CPU, 20-inch LCD monitor, wired keyboard and mouse, home office setting, dark screen reflection.
- `products/ghe-go`: Two sturdy matching wooden dining chairs with vertical slat backs, warm honey-brown finish in 80% condition, on encaustic tiles, clearly chairs.
```

---

## PHẦN 5: QUY TRÌNH THỰC THI 8 BƯỚC KHÔNG LỖI (STEP-BY-STEP PLAYBOOK)

Để đảm bảo toàn bộ 51/51 ảnh nội dung được làm mới và vượt qua mọi kiểm thử tự động, agent thực hiện phải tuân thủ nghiêm ngặt 8 bước sau:

```
                      QUY TRÌNH 8 BƯỚC THỰC THI CHUẨN XÁC
  ┌────────────────────────────────────────────────────────────────────────┐
  │ [B1] Chuẩn bị thư mục assets-src/content/{rewards,shops,swap,products} │
  │                                  ▼                                     │
  │ [B2] Tạo 39 ảnh thô qua generate_image (dùng Thư viện Prompt Phần 3)  │
  │                                  ▼                                     │
  │ [B3] Chuyển đổi WebP qua node scripts/collab/content-image.mjs         │
  │                                  ▼                                     │
  │ [B4] Cập nhật object IMAGES trong src/data/mock-data.ts (15 đường dẫn) │
  │                                  ▼                                     │
  │ [B5] Kiểm tra thiếu ảnh: node scripts/collab/content-missing.mjs       │
  │                                  ▼                                     │
  │ [B6] Sinh & Soi 5 bảng ảnh: node scripts/collab/content-sheet.mjs      │
  │                                  ▼                                     │
  │ [B7] Ghi đè tệp nhật ký: public/content/NGUON-ANH.md (đủ 51 mục)       │
  │                                  ▼                                     │
  │ [B8] Smoke test & chụp 5 màn hình: node assets-src/content/capture-pages│
  └────────────────────────────────────────────────────────────────────────┘
```

### Bước 1: Khởi tạo các thư mục ảnh thô
Tạo các thư mục nếu chưa có:
- `assets-src/content/rewards/`
- `assets-src/content/shops/`
- `assets-src/content/swap/`
- `assets-src/content/products/`

### Bước 2: Tạo 39 ảnh thô bằng công cụ `generate_image`
Lần lượt gọi `generate_image` với Thư viện Prompt ở Phần 3:
- **5 ảnh `rewards`**: truyền `AspectRatio: "1:1"`.
- **8 ảnh `shops`**: truyền `AspectRatio: "4:3"`.
- **12 ảnh `swap`**: truyền `AspectRatio: "4:3"`.
- **14 ảnh `products`**: truyền `AspectRatio: "4:3"`.
Lưu file vào đường dẫn tương ứng: `assets-src/content/<nhóm>/<tên>.png`.

### Bước 3: Chuyển đổi hàng loạt ảnh thô sang `.webp` đúng kích thước
Sử dụng script `content-image.mjs` để tối ưu hóa và nén WebP dưới 150 KB:
- Nhóm `rewards` (800×800):
  ```powershell
  node scripts/collab/content-image.mjs assets-src/content/rewards/chau-luoi-ho.png public/content/rewards/chau-luoi-ho.webp 800 800
  node scripts/collab/content-image.mjs assets-src/content/rewards/dung-cu-lam-vuon-mini.png public/content/rewards/dung-cu-lam-vuon-mini.webp 800 800
  node scripts/collab/content-image.mjs assets-src/content/rewards/ly-thuy-tinh-tai-che.png public/content/rewards/ly-thuy-tinh-tai-che.webp 800 800
  node scripts/collab/content-image.mjs assets-src/content/rewards/ong-hut-inox.png public/content/rewards/ong-hut-inox.webp 800 800
  node scripts/collab/content-image.mjs assets-src/content/rewards/tui-luoi-dung-rau.png public/content/rewards/tui-luoi-dung-rau.webp 800 800
  ```
- Nhóm `shops` (1200×900):
  ```powershell
  node scripts/collab/content-image.mjs assets-src/content/shops/phan-huu-co-ba-la.png public/content/shops/phan-huu-co-ba-la.webp 1200 900
  node scripts/collab/content-image.mjs assets-src/content/shops/tiem-gon-gang-xanh.png public/content/shops/tiem-gon-gang-xanh.webp 1200 900
  node scripts/collab/content-image.mjs assets-src/content/shops/xuong-thuy-tinh-tai-sinh.png public/content/shops/xuong-thuy-tinh-tai-sinh.webp 1200 900
  node scripts/collab/content-image.mjs assets-src/content/shops/vuon-uom-cay-nha-minh.png public/content/shops/vuon-uom-cay-nha-minh.webp 1200 900
  node scripts/collab/content-image.mjs assets-src/content/shops/nong-trai-dat-lanh.png public/content/shops/nong-trai-dat-lanh.webp 1200 900
  node scripts/collab/content-image.mjs assets-src/content/shops/dung-cu-xanh-nam-sai-gon.png public/content/shops/dung-cu-xanh-nam-sai-gon.webp 1200 900
  node scripts/collab/content-image.mjs assets-src/content/shops/tiem-xa-bong-sinh-thai.png public/content/shops/tiem-xa-bong-sinh-thai.webp 1200 900
  node scripts/collab/content-image.mjs assets-src/content/shops/vuon-pho-xanh-ri.png public/content/shops/vuon-pho-xanh-ri.webp 1200 900
  ```
- Nhóm `swap` (1000×750):
  ```powershell
  node scripts/collab/content-image.mjs assets-src/content/swap/mau-1.png public/content/swap/mau-1.webp 1000 750
  node scripts/collab/content-image.mjs assets-src/content/swap/mau-2.png public/content/swap/mau-2.webp 1000 750
  node scripts/collab/content-image.mjs assets-src/content/swap/mau-3.png public/content/swap/mau-3.webp 1000 750
  node scripts/collab/content-image.mjs assets-src/content/swap/mau-4.png public/content/swap/mau-4.webp 1000 750
  node scripts/collab/content-image.mjs assets-src/content/swap/s-ao-khoac-jean.png public/content/swap/s-ao-khoac-jean.webp 1000 750
  node scripts/collab/content-image.mjs assets-src/content/swap/s-sach-giao-khoa-lop-5.png public/content/swap/s-sach-giao-khoa-lop-5.webp 1000 750
  node scripts/collab/content-image.mjs assets-src/content/swap/s-noi-com-dien.png public/content/swap/s-noi-com-dien.webp 1000 750
  node scripts/collab/content-image.mjs assets-src/content/swap/s-xe-day-em-be.png public/content/swap/s-xe-day-em-be.webp 1000 750
  node scripts/collab/content-image.mjs assets-src/content/swap/s-vay-cong-so.png public/content/swap/s-vay-cong-so.webp 1000 750
  node scripts/collab/content-image.mjs assets-src/content/swap/s-truyen-tranh.png public/content/swap/s-truyen-tranh.webp 1000 750
  node scripts/collab/content-image.mjs assets-src/content/swap/s-bo-chen-bat.png public/content/swap/s-bo-chen-bat.webp 1000 750
  node scripts/collab/content-image.mjs assets-src/content/swap/s-lego-hop.png public/content/swap/s-lego-hop.webp 1000 750
  ```
- Nhóm `products` (1200×900):
  ```powershell
  node scripts/collab/content-image.mjs assets-src/content/products/giay-vun.png public/content/products/giay-vun.webp 1200 900
  node scripts/collab/content-image.mjs assets-src/content/products/nhua-cac-loai.png public/content/products/nhua-cac-loai.webp 1200 900
  node scripts/collab/content-image.mjs assets-src/content/products/chai-lo-thuy-tinh.png public/content/products/chai-lo-thuy-tinh.webp 1200 900
  node scripts/collab/content-image.mjs assets-src/content/products/do-dien-tu-cu.png public/content/products/do-dien-tu-cu.webp 1200 900
  node scripts/collab/content-image.mjs assets-src/content/products/do-gia-dung-thanh-ly.png public/content/products/do-gia-dung-thanh-ly.webp 1200 900
  node scripts/collab/content-image.mjs assets-src/content/products/carton-ep-kien.png public/content/products/carton-ep-kien.webp 1200 900
  node scripts/collab/content-image.mjs assets-src/content/products/chai-pet.png public/content/products/chai-pet.webp 1200 900
  node scripts/collab/content-image.mjs assets-src/content/products/lon-nhom.png public/content/products/lon-nhom.webp 1200 900
  node scripts/collab/content-image.mjs assets-src/content/products/quat-cay-cu.png public/content/products/quat-cay-cu.webp 1200 900
  node scripts/collab/content-image.mjs assets-src/content/products/ban-go-cu.png public/content/products/ban-go-cu.webp 1200 900
  node scripts/collab/content-image.mjs assets-src/content/products/giay-bao-cu.png public/content/products/giay-bao-cu.webp 1200 900
  node scripts/collab/content-image.mjs assets-src/content/products/chai-thuy-tinh-nguyen.png public/content/products/chai-thuy-tinh-nguyen.webp 1200 900
  node scripts/collab/content-image.mjs assets-src/content/products/may-tinh-ban-cu.png public/content/products/may-tinh-ban-cu.webp 1200 900
  node scripts/collab/content-image.mjs assets-src/content/products/ghe-go.png public/content/products/ghe-go.webp 1200 900
  ```

### Bước 4: Cập nhật `src/data/mock-data.ts`
Chỉ thay thế object `IMAGES` (dòng 4-20) theo mã nguồn đã cung cấp tại Mục 4.1.

### Bước 5: Kiểm tra liên kết ảnh
Chạy lệnh:
```powershell
node scripts/collab/content-missing.mjs
```
Kết quả kỳ vọng:
```
Ảnh được nhắc tới trong dữ liệu: 51
✓ Không thiếu ảnh nào (0).
```

### Bước 6: Ghép bảng soi ảnh và duyệt bằng mắt từng ô
Chạy lệnh:
```powershell
node scripts/collab/content-sheet.mjs
```
Mở 5 tệp PNG trong `assets-src/content/_sheet/`:
- `learn.png` (8 ô)
- `rewards.png` (8 ô)
- `shops.png` (8 ô)
- `swap.png` (12 ô)
- `products.png` (15 ô)
Soát xét từng ô qua 7 câu hỏi ở Mục 6 của prompt. Nếu có ô nào chưa đạt, tạo lại ảnh đó bằng `generate_image` và chạy lại Bước 3.

### Bước 7: Cập nhật nhật ký nguồn ảnh `public/content/NGUON-ANH.md`
Ghi đè nội dung theo đúng Mục 4.2 (đủ 51 dòng trung thực, không bịa đặt).

### Bước 8: Kiểm thử hồi quy, Build và Chụp ảnh màn hình tự động
1. Chạy lint và build kiểm tra tính toàn vẹn:
   ```powershell
   npm.cmd run lint
   npm.cmd run build
   ```
2. Khởi chạy production server ở cổng 3100 (trong terminal chạy nền hoặc task):
   ```powershell
   npx.cmd next start -p 3100
   ```
3. Chạy script chụp ảnh tự động kiểm tra giao diện thực tế:
   ```powershell
   node assets-src/content/capture-pages.mjs
   ```
   Script sẽ tự chụp 5 trang lưu vào `assets-src/content/_check/`:
   - `01-kien-thuc.png`
   - `02-doi-qua.png`
   - `03-gian-hang.png`
   - `04-trao-doi.png`
   - `05-kham-pha.png`
4. Dừng server cổng 3100 sau khi chụp xong.

---

## PHẦN 6: REMAINING QUESTIONS & GAPS (CÁC CÂU HỎI VÀ KHOẢNG TRỐNG CÒN LẠI)

1. **Quota và giới hạn tần suất của công cụ `generate_image`**:
   - Việc sinh 39 ảnh liên tiếp trong một phiên làm việc có thể chạm ngưỡng rate-limit của API tạo ảnh. Người thực hiện tiếp theo nên chia thành 4 mẻ (batch) theo từng nhóm: Rewards (5) → Shops (8) → Swap (12) → Products (14), kiểm tra chất lượng từng mẻ trước khi chuyển sang mẻ tiếp theo.
2. **Xung đột cổng 3100 khi chạy `capture-pages.mjs`**:
   - Nếu cổng 3100 đang bị chiếm dụng bởi một tiến trình chạy ngầm trước đó, lệnh `next start -p 3100` sẽ báo lỗi `EADDRINUSE`. Cần chạy `Get-Process -Id (Get-NetTCPConnection -LocalPort 3100).OwningProcess` để giải phóng cổng nếu cần.
3. **Ưu tiên cho Worker tiếp theo (Improvement / Execution Worker)**:
   - Worker tiếp theo chỉ việc áp dụng bộ Prompt Library chi tiết ở Phần 3 để gọi `generate_image`, hoàn toàn không cần tự sáng tác prompt.
   - Tuyệt đối không xóa hay chỉnh sửa 12 ảnh đã đạt chuẩn được liệt kê ở Phần 1.1.
   - Tuân thủ quy tắc LUẬT CỨNG: Không can thiệp vào các tệp lobby, không commit git (để người dùng tự review và commit).