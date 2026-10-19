# Prompt cho Gemini 3.8 Flash (Antigravity): làm lại giao diện lobby Green City

> Cách dùng: mở dự án `C:\123` trong Antigravity, chọn Gemini 3.8 Flash, rồi dán **toàn bộ** phần từ "BẮT ĐẦU PROMPT" tới "KẾT THÚC PROMPT".

---

## BẮT ĐẦU PROMPT

# VAI TRÒ
Bạn là **art director kiêm frontend designer**. Dự án Next.js 16 + Tailwind 4 trong thư mục này là **Green City**: web giúp người dân TP.HCM bán ve chai và đồ cũ, tìm mua phế liệu theo khu vực, và gọi người thu gom tới tận nhà.

Phần **chuyển động, logic và cấu trúc đã hoàn thiện**, chạy 60 fps, không được đụng vào. Việc của bạn chỉ là **phần nhìn**: thay toàn bộ hình ảnh tạm xấu bằng ảnh đẹp như chụp thật, rồi tinh chỉnh thẩm mỹ của trang lobby cho khớp với ảnh mới.

Bạn phải làm **trọn vẹn tới khi mọi lệnh kiểm tra ở mục ĐỊNH NGHĨA HOÀN THÀNH đều báo đạt**. Không làm một nửa. Không để lại TODO. Không báo "xong" khi còn bất kỳ mục FAIL nào. Không hỏi lại người dùng giữa chừng, trừ trường hợp ghi ở mục KHI GẶP KHÓ.

# HIỆN TRẠNG: NHỮNG CHỖ XẤU PHẢI THAY
Mở `http://localhost:3000` (hoặc tự build và chạy theo Bước 7) để thấy tận mắt. Tất cả ảnh hiện tại là **ảnh tạm**, có in chữ "ẢNH TẠM":
1. **Xe đạp ve chai** ở góc phải hero: vẽ bằng khối hình học thô. Thùng carton là các hình chữ nhật, bao chai là một hình tròn có mấy cái que, khung xe là các đường thẳng. Trông giả và xấu.
2. **Nền trời và phố**: các khối chữ nhật xanh nhạt xếp hàng, không ra thành phố.
3. **Lớp lá phía trước**: các hình elip xanh đậm, cứng, cắt ngang thành một dải.
4. **3 ảnh tính năng**: hình minh họa phẳng (hộp và điện thoại; 3 cái bao như viên thuốc; xe ba gác bằng khối).
5. **Nền khối kêu gọi cuối trang** và **ảnh dọc ở trang đăng nhập**: chỉ là gradient với vài hình elip.

# LUẬT CỨNG

## ĐƯỢC PHÉP sửa (chỉ những thứ này)
- 8 file ảnh trong `public/lobby/`, **chỉ qua quy trình ở mục QUY TRÌNH**, không ghi tay.
- Ảnh thô trong `assets-src/lobby/`, thư mục do bạn tạo.
- Trường `alt` trong `src/lobby/assets.ts`, để mô tả đúng ảnh mới (tiếng Việt, ngắn).
- Class Tailwind **thuần trình bày** trong `src/lobby/sections/*.tsx`: cỡ chữ, khoảng cách, bo góc, đổ bóng, màu, và kích thước hoặc vị trí của khối `data-layer="subject"` và `data-layer="fog"`.
- Trong `src/lobby/lobby.css` **chỉ** được đổi 2 quy tắc: `.lobby-outline-text` (độ dày nét, màu, opacity trong khoảng 0.10–0.18) và `.lobby-grain` (opacity trong khoảng 0.03–0.06).

## CẤM (vi phạm một mục là thất bại)
- Không sửa `src/lobby/animations/**`, `src/lobby/config.ts`, `src/lobby/LobbyPage.tsx`, phần còn lại của `src/lobby/lobby.css`, `src/store/**`, `src/lib/**`, `src/app/**`, `src/pages-views/**`, `src/components/**`, `package.json`, `next.config.ts`.
- Không sửa, xóa hay "nới" bất cứ gì trong `scripts/lobby-assets/**`. Đây là bộ chấm điểm; hạ ngưỡng hay sửa hash là gian lận.
- Trong `src/lobby/assets.ts`, ngoài `alt` thì không đổi `src`, `width`, `height`, `transparent`, `maxKB`.
- Không xóa, đổi tên hay di chuyển bất kỳ thuộc tính `data-*` nào: `data-hero`, `data-layer`, `data-mouse`, `data-intro`, `data-split-title`, `data-slogan-line`, `data-hero-cta`, `data-magnetic`, `data-scroll-hint`, `data-hint-inner`, `data-veil`, `data-header`, `data-features`, `data-feature`, `data-feature-media`, `data-feature-img`, `data-feature-text`.
- Không đổi cấu trúc lồng nhau (`[data-layer] > [data-mouse] > img`) và không đổi thứ tự `z-index` của 5 lớp hero.
- Không bỏ class `pointer-events-none` ở lớp `subject` và `fog`.
- Không thêm thư viện. Không thêm animation, keyframe hay transition mới.
- Không đổi câu chữ: tiêu đề, slogan, chữ trên nút, mô tả tính năng.
- Màu trong lobby chỉ dùng thang `gc-50` → `gc-950` (khai báo trong `src/app/globals.css`), cộng với trắng và đen có độ trong suốt.
- Không dùng ảnh tải từ Internet hay ảnh stock. Mọi ảnh phải do bạn tạo bằng công cụ tạo ảnh.

# ART DIRECTION CHUNG (áp dụng cho cả 8 ảnh, để ghép lại không lộ cắt dán)
- **Phong cách:** ảnh chụp phóng sự đời thường ở Sài Gòn, như chụp bằng Fujifilm X100V với giả lập màu Classic Chrome. Có kết cấu thật và chút không hoàn hảo tự nhiên. **Không** giống 3D render, minh họa hay "ảnh AI bóng bẩy".
- **Thời điểm và ánh sáng:** sáng sớm khoảng 6h30. Nắng ấm dịu chiếu từ **phía trên bên phải** (khoảng hướng 2 giờ), không khí có chút sương mỏng.
- **Góc máy:** ngang tầm mắt người đứng (khoảng 1,5 m), ống kính tương đương 35mm.
- **Màu:** tông xanh lá dịu đồng bộ (bảng màu `#f3f9ee #e4f2d9 #c8e5b1 #a3d17c #7fb93f #4f9a2c #2f7d2c #186028 #124a20 #0c3517 #06200d`). Vùng sáng hơi kem ấm, vùng tối xanh rêu. Độ bão hòa vừa phải.
- **Chủ đề:** môi trường đô thị, thu gom ve chai, tái chế. Đời thường, tôn trọng người lao động.
- **Phủ định (đưa vào mọi prompt):** `no text, no letters, no signage, no logos, no watermark, no glowing effects, no lens flare, no bokeh balls, no neon, no HDR, no oversaturation, no plastic CGI look, no extra fingers, no distorted hands, no one looking at the camera`.

# 8 ẢNH PHẢI TẠO
Lưu ảnh thô vào `assets-src/lobby/<key>.png`, đặt tên **đúng key** trong bảng. Script sẽ tự cắt về kích thước cuối.

| key | Ảnh cuối (script tạo) | Tỉ lệ khi tạo ảnh thô | Nền ảnh thô |
|---|---|---|---|
| `sky` | `hero-layer-1-sky.webp` 2560×1440 | 16:9 | ảnh thật |
| `subject` | `hero-layer-4-subject.webp` 1600×1600 | 1:1 | **magenta trơn #FF00FF** |
| `foreground` | `hero-layer-5-foreground.webp` 2560×800 | 16:9 | **magenta trơn #FF00FF** |
| `feature1` | `feature-1-ban-do-cu.webp` 1200×900 | 4:3 | ảnh thật |
| `feature2` | `feature-2-tim-mua.webp` 1200×900 | 4:3 | ảnh thật |
| `feature3` | `feature-3-thu-gom.webp` 1200×900 | 4:3 | ảnh thật |
| `ctaBackground` | `cta-background.webp` 2400×1200 | 16:9 | ảnh thật |
| `authPanel` | `auth-panel.webp` 1400×1800 | 3:4 | ảnh thật |

Dùng độ phân giải cao nhất mà công cụ tạo ảnh cho phép.

### 1. `sky`: lớp 1, bầu trời và phố xa
- **Vai trò:** phủ kín màn hình, nằm sau cùng. Tiêu đề chữ xanh rất đậm nằm ở **nửa trái, từ 10% tới 60% chiều cao**, nên vùng đó phải **sáng, thoáng, gần như chỉ có trời**. Bộ chấm điểm sẽ đo tương phản và yêu cầu ≥ 4.5:1.
- **Prompt:** `Wide early-morning photograph over a Ho Chi Minh City neighborhood, soft hazy pale mint-green and warm cream sky filling the upper two thirds, low-rise tube houses with tiled roofs and a few distant towers fading into atmospheric haze along the horizon at about 65% frame height, buildings concentrated on the right half, the left half almost only bright calm sky, gentle warm sunlight from the upper right, documentary photography, Fujifilm Classic Chrome look, 35mm, eye level, muted natural green color grade, 16:9` + phủ định chung.

### 2. `subject`: lớp 4, chiếc xe ve chai (vật thể chính, quan trọng nhất)
- **Vai trò:** đứng ở góc phải dưới, mép dưới bánh xe chạm đáy khung, che nhẹ cuối dòng thứ hai của tiêu đề. Phải là **điểm nhấn đẹp nhất trang**.
- **Bắt buộc:**
  - Ảnh chụp thật của một chiếc xe đạp ve chai Việt Nam: khung thép cũ kiểu xe đạp mini hoặc xe Nhật, đủ **2 bánh tròn có nan hoa**.
  - Trên baga sau có tấm ván gỗ, chở chồng bìa carton ép dẹt buộc dây nhựa.
  - Một bao tải dứa (bao nylon đan) đựng chai nhựa trong treo bên hông.
  - Rổ phía trước có vài lon nhôm, một chiếc nón lá treo trên ghi-đông.
  - Góc nhìn 3/4, **đầu xe quay sang trái**, đứng trên chân chống.
  - Nền **magenta trơn tuyệt đối**, không đổ bóng lên nền. Vật thể **không chạm 4 cạnh khung**, chừa lề khoảng 5%.
  - Trên xe **không có màu tím, hồng hay magenta**.
- **Prompt:** `Photorealistic product-style photo of a traditional Vietnamese scrap-collector bicycle: old steel-frame city bicycle with two round spoked wheels, a wooden board on the rear rack carrying a tall neat stack of flattened cardboard tied with plastic rope, a woven nylon sack of clear plastic bottles hanging on the side, a small front basket with aluminum cans, a Vietnamese conical hat hanging on the handlebar, three-quarter view with the front wheel facing left, standing on its kickstand, soft warm morning light from the upper right, realistic worn textures, isolated on a perfectly flat solid magenta (#FF00FF) background, no shadow on the background, whole bicycle visible with about 5% margin on every side, no pink or purple on the bicycle` + phủ định chung.

### 3. `foreground`: lớp 5, lá cây gần ống kính
- **Vai trò:** dải sát đáy màn hình, cao khoảng 30% màn hình, chạy nhanh hơn tốc độ cuộn để tạo chiều sâu. Nút "Bắt đầu ngay" nằm ngay phía trên dải này, nên **nửa trên ảnh thô phải hoàn toàn là magenta**.
- **Bắt buộc:** chỉ có lá (lá chuối, dương xỉ) **mờ nhòe vì ở rất gần ống kính**, đi vào từ **góc dưới trái và góc dưới phải**, chạm cạnh đáy. Phần giữa đáy chỉ là sương trắng mỏng hoặc trống. Nền magenta trơn tuyệt đối. Không có hoa hay màu hồng tím.
- **Prompt:** `Very out-of-focus tropical banana and fern leaves extremely close to the lens, entering only from the bottom-left and bottom-right corners and touching the bottom edge, a thin soft white morning mist low along the bottom center, warm backlight from the upper right, strong foreground depth-of-field blur, the entire upper half is empty flat solid magenta (#FF00FF) background, no flowers, no pink or purple leaves, 16:9` + phủ định chung.

### 4. `feature1`: "Bán đồ cũ trong một phút"
- **Prompt:** `Close-up documentary photo of a person's hands holding a smartphone, photographing a neatly tied stack of flattened cardboard boxes on the doorstep of a Saigon tube house, potted plants nearby, morning light from the upper right, natural skin and textures, the phone screen shows only a blurred camera preview, Fujifilm Classic Chrome look, soft green color grade, 4:3` + phủ định chung.

### 5. `feature2`: "Tìm đúng loại, đúng khu"
- **Prompt:** `Documentary photo of several sorted sacks of recyclables lined up on a small Saigon sidewalk: crushed aluminum cans, clear plastic bottles, bundles of old newspapers tied with string, a small scrap yard entrance softly blurred behind, morning light from the upper right, calm uncluttered composition with clear separation between the sacks, Fujifilm Classic Chrome look, soft green color grade, 4:3` + phủ định chung.

### 6. `feature3`: "Gọi người tới tận nhà"
- **Prompt:** `Respectful documentary photo of a Vietnamese waste collector wearing a cap and long sleeves, loading tied sacks of recyclables onto a small cargo tricycle (xe ba gac) at the entrance of a narrow Saigon alley, early morning, warm light from the upper right, the person seen in profile or from behind, dignified and calm, Fujifilm Classic Chrome look, soft green color grade, 4:3` + phủ định chung.

### 7. `ctaBackground`: nền khối kêu gọi cuối trang
- **Vai trò:** chữ trắng nằm ở **nửa trái**, nên nửa trái phải **tối và trống**; chi tiết dồn sang nửa phải. Bộ chấm điểm đo độ sáng nửa trái.
- **Prompt:** `Dark moody documentary photo of a quiet Saigon alley at dawn, lush potted plants and hanging greenery on the right side, a neatly sorted pile of recyclables by a doorway on the right, deep moss-green shadows, the left half very dark, empty and calm, faint warm light from the upper right, Fujifilm Classic Chrome look, 16:9` + phủ định chung.

### 8. `authPanel`: ảnh dọc bên trái trang đăng nhập
- **Vai trò:** có câu trích dẫn chữ trắng ở **1/3 dưới**, nên vùng đó phải tối và đơn giản.
- **Prompt:** `Vertical documentary photo in a Saigon alley: a woman hands a tied bundle of old newspapers to a waste collector standing beside a scrap bicycle, early morning, warm light from the upper right, both people in profile, not looking at the camera, green leaves on the walls, the lower third darker and simple, Fujifilm Classic Chrome look, soft green color grade, 3:4 portrait` + phủ định chung.

# QUY TRÌNH BẮT BUỘC (làm đủ, đúng thứ tự)
**Bước 0. Mốc ban đầu.** Chạy `npm install`, rồi `npm run assets:verify`. Kết quả mong đợi lúc này: báo 8 mục "Vẫn là ẢNH TẠM".

**Bước 1. Tạo 8 ảnh thô** theo mục 8 ẢNH PHẢI TẠO, lưu đúng `assets-src/lobby/<key>.png`.

**Bước 2. Tự soát ảnh thô** theo TIÊU CHÍ THẨM MỸ bên dưới. Ảnh nào trượt dù chỉ 1 tiêu chí thì tạo lại ảnh đó, chỉnh prompt cho cụ thể hơn. Riêng `subject` phải tạo **ít nhất 3 phương án** rồi chọn bản đẹp nhất.

**Bước 3. Xử lý.** Chạy `npm run assets:process`. Script tự cắt đúng kích thước, tách nền magenta thành alpha thật, khử viền tím, đặt xe chạm đáy, ép 40% phía trên lớp lá thành trong suốt, và nén WebP đúng dung lượng.
- Phải thấy đủ **8 dòng ✓**.
- Có dòng ✗ thì đọc thông báo, tạo lại ảnh đó, rồi chạy `npm run assets:process -- <key>`.

**Bước 4. Chấm điểm ảnh.** Chạy `npm run assets:verify`, phải in ra "✓ TẤT CẢ ĐẠT".
- Có FAIL thì **tạo lại ảnh** cho đúng yêu cầu. Ví dụ: nửa trái ảnh `sky` quá tối → tạo trời sáng và thoáng hơn.
- Tuyệt đối không sửa script.

**Bước 5. Soát ảnh cuối.** Mở 8 file trong `public/lobby/`:
- Ảnh `subject` và `foreground`: đặt lên cả nền trắng lẫn nền xanh rất tối (`#06200d`). Không được có viền tím hay hồng, không lẹm mất chi tiết.
- Xe phải còn đủ 2 bánh xe.

**Bước 6. Tinh chỉnh giao diện lobby** cho khớp ảnh mới, chỉ trong phạm vi ĐƯỢC PHÉP. Bắt buộc làm đủ 5 việc:
- a) **Hero desktop:** chỉnh kích thước và vị trí khối `data-layer="subject"` để xe là điểm nhấn: che nhẹ phần cuối dòng 2 của tiêu đề nhưng **không che chữ tới mức khó đọc** và **không che nút**.
- b) **Hero mobile (390px):** xe nằm dưới nút CTA và không đè chữ "Cuộn xuống".
- c) **Chữ viền "VE CHAI":** chỉnh `.lobby-outline-text` (màu, độ dày nét, opacity 0.10–0.18) để hòa với ảnh trời mới, nhìn ra nhưng không tranh với tiêu đề.
- d) **Phần tính năng:** cân lại khoảng cách, bo góc ảnh và đổ bóng nhẹ cho hợp ảnh thật. Giữ bố cục so le trái phải.
- e) **Khối CTA và header:** đảm bảo chữ và nút đọc rõ trên ảnh mới. Được tăng giảm độ đậm lớp gradient phủ trong `LobbyCta.tsx`, nhưng tương phản chữ trắng phải ≥ 4.5:1.

**Bước 7. Kiểm tra kỹ thuật:**
1. `npm run lint` → 0 lỗi.
2. `npm run build` → thành công.
3. Chạy nền `npx next start -p 3100` (giữ chạy).
4. `npm run lobby:smoke -- http://localhost:3100` → phải in ra "✓ TẤT CẢ ĐẠT".

Lệnh này mở Chrome thật, kiểm tra nút có bị che không, có cuộn ngang không, đoạn ghim, ảnh có tải được không, console có lỗi không, rồi chụp 5 ảnh vào `assets-src/lobby/_check/`.

**Bước 8. Tự soát ảnh chụp.** Mở 5 ảnh trong `assets-src/lobby/_check/` và trả lời từng câu trong TIÊU CHÍ GIAO DIỆN. Câu nào là "không" thì quay lại Bước 6 hoặc Bước 1, rồi chạy lại Bước 7.

**Bước 9. Báo cáo** đúng theo MẪU BÁO CÁO.

# TIÊU CHÍ THẨM MỸ CHO TỪNG ẢNH (phải đạt hết)
- [ ] Trông như **ảnh chụp thật**, không giống render, tranh vẽ hay ảnh AI bóng bẩy.
- [ ] Ánh sáng đến từ **trên bên phải**, giống các ảnh khác.
- [ ] Tông xanh lá dịu thống nhất; không ảnh nào lệch hẳn sang vàng cam hay xanh dương.
- [ ] Không có chữ, biển hiệu, logo hay watermark (kể cả chữ méo mó vô nghĩa).
- [ ] Người (nếu có): tay chân và ngón tay tự nhiên, không nhìn vào ống kính, được thể hiện đàng hoàng.
- [ ] Xe đạp: 2 bánh tròn đủ nan, khung đúng cấu tạo xe đạp, đồ chất lên trông chắc chắn và thật.
- [ ] Bố cục đúng phần "Vai trò" của ảnh đó (vùng phải trống thì trống, vùng phải tối thì tối).

# TIÊU CHÍ GIAO DIỆN (trả lời có/không, kèm tên ảnh chụp làm bằng chứng)
1. `desktop-1440.png`: tiêu đề "Đồ cũ nhà bạn chưa phải là rác." đọc rõ hoàn toàn trên nền trời?
2. `desktop-1440.png`: xe là điểm nhấn đẹp, che nhẹ cuối dòng 2 mà không làm khó đọc?
3. `desktop-1440.png`: nút "Bắt đầu ngay" rõ, không bị lá hay xe che?
4. `desktop-1440.png`: 5 lớp ghép liền mạch, không lộ cảm giác cắt dán, không lộ mép ảnh?
5. `desktop-pin.png`: lúc cuộn, cảnh vẫn đẹp, không lộ khoảng trống hay mép ảnh?
6. `desktop-bottom.png`: chữ trắng ở khối cuối trang đọc rõ?
7. `mobile-390.png`: tiêu đề, slogan và nút gọn gàng; xe nằm dưới nút?
8. `login-1440.png`: ảnh bên trái đẹp, câu trích dẫn chữ trắng ở dưới đọc rõ?
9. Không còn chỗ nào có chữ "ẢNH TẠM"?

# ĐỊNH NGHĨA HOÀN THÀNH (đủ tất cả mới được báo xong)
- [ ] `npm run assets:process` đủ 8 dòng ✓
- [ ] `npm run assets:verify` in "✓ TẤT CẢ ĐẠT"
- [ ] `npm run lint` 0 lỗi, `npm run build` thành công
- [ ] `npm run lobby:smoke -- http://localhost:3100` in "✓ TẤT CẢ ĐẠT"
- [ ] 9 câu TIÊU CHÍ GIAO DIỆN đều là "có"
- [ ] `git diff --stat` chỉ có thay đổi trong phạm vi ĐƯỢC PHÉP

# KHI GẶP KHÓ
- Công cụ tạo ảnh trả kết quả xấu hoặc sai yêu cầu: tạo lại với prompt cụ thể hơn, tối đa 6 lần cho mỗi ảnh.
- Công cụ không tạo được nền magenta trơn: thêm vào prompt `studio cutout on seamless flat #FF00FF magenta paper backdrop, evenly lit, no gradient`.
- `assets:process` báo "Nền ảnh thô không phải màu trơn": ảnh thô có nền ca-rô giả hoặc nền thật. Tạo lại trên magenta trơn.
- `assets:process` báo không nén được: ảnh quá nhiều hạt nhiễu. Tạo lại với bố cục gọn và ít chi tiết vụn hơn.
- Chỉ được dừng và hỏi người dùng khi **công cụ tạo ảnh hoàn toàn không dùng được**. Khi đó báo chính xác ảnh nào chưa làm và lỗi gì. **Không được báo là đã xong.**

# MẪU BÁO CÁO (bắt buộc đúng mẫu)
```
## Kết quả
| key | Ảnh cuối | Kích thước | KB | Số lần tạo lại | Đạt tiêu chí thẩm mỹ |
|-----|----------|-----------|----|----------------|----------------------|
(đủ 8 dòng)

## Lệnh kiểm tra (dán nguyên dòng kết quả cuối của mỗi lệnh)
- assets:process: ...
- assets:verify: ...
- lint: ...
- build: ...
- lobby:smoke: ...

## Tiêu chí giao diện (9 câu, có/không + ảnh chụp làm bằng chứng)
1. ...

## File đã sửa (dán `git diff --stat`)
...
```

## KẾT THÚC PROMPT
