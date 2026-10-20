# Prompt cho Gemini 3.8 Flash (Antigravity): thay 3 ảnh cây còn là hình vẽ

> Cập nhật 20/10/2026: Claude đã làm xong **toàn bộ code** của tiêu đề chữ lá: lá rủ trong chữ, 3D, hoa mọc ra ngoài, kiểm tra trên trình duyệt. Gemini **chỉ** còn phải thay 3 ảnh dưới đây.
> Cách dùng: mở `C:\123` trong Antigravity, chọn Gemini 3.8 Flash, dán phần từ "BẮT ĐẦU PROMPT" tới "KẾT THÚC PROMPT".

---

## BẮT ĐẦU PROMPT

# VIỆC DUY NHẤT

Thay **3 ảnh thô** trong `assets-src/ink/` bằng **ảnh chụp thật** do **công cụ tạo ảnh** của bạn tạo ra. Giữ **đúng tên file**: code đã dùng sẵn các tên này.

Lần trước bạn tự vẽ 3 hình này bằng code SVG (`generate-assets.mjs`, file đó đã bị xóa). Đặt cạnh lá ảnh thật, chúng trông như clipart. **Cấm vẽ bằng code.** Không SVG, không canvas, không `sharp({ create })`.

| File (ghi đè) | Mô tả cho công cụ tạo ảnh |
|---|---|
| `assets-src/ink/flower-su.png` | Ảnh macro chụp thật **một bông hoa sứ (plumeria) trắng, nhụy vàng**, chính diện, cánh hoa có vân và bóng tự nhiên. |
| `assets-src/ink/flower-lai.png` | Ảnh macro chụp thật **một chùm 3 bông hoa lài trắng** kèm 1–2 nụ và 2 lá nhỏ, chính diện. |
| `assets-src/ink/sprout.png` | Ảnh macro chụp thật **một cây mầm đậu xanh** mọc thẳng, 2 lá mầm tròn, gốc ở **chính giữa mép dưới**. |

**Yêu cầu chung cho cả 3 ảnh:**
- Vuông, cạnh ≥ 1024px.
- **Nền phẳng một màu magenta `#FF00FF`**, không bóng đổ lên nền, không có vật gì khác.
- Ánh sáng tự nhiên dịu từ phía trên bên phải.
- Trong cây và hoa không có màu hồng hay tím.
- Phủ định: `no illustration, no vector, no clipart, no cartoon, no 3D render, no text, no watermark, no shadow on background, no other objects`.

# CÁCH LÀM
1. Tạo 3 ảnh, ghi đè 3 file trên.
2. Chạy `npm run ink:sprites`. Script tự tách nền, thêm bóng đổ, xuất WebP và in ra một bảng. Mọi dòng phải có `magenta % = 0.000`. Gặp lỗi thì tạo lại ảnh. **Không sửa script.**
3. Chạy `npm test`: phải đạt hết.
4. Chạy dev server rồi `node scripts/ink-headings/smoke.mjs http://localhost:3000`. Mở `assets-src/ink/_check/hero-1440-3.5s.png` và `features-2-1440.png`, nhìn bằng mắt: hoa và mầm phải là ảnh thật, rõ là hoa gì, không viền tím.

# CẤM
- Không sửa file nào khác ngoài 3 ảnh thô trên và các file `.webp` do `npm run ink:sprites` sinh ra.
- Không đổi kích thước hay vị trí cây trong code.
- Không commit. Người dùng tự commit.

# BÁO CÁO
Dán bảng in ra của `ink:sprites` và 2 ảnh chụp ở bước 4.

## KẾT THÚC PROMPT
