# Báo cáo hoàn thành 6 tính năng cơ bản Green City (Gemini)

## Kết quả
| Mã | Tính năng | Route | Xong? | Ghi chú |
|----|-----------|-------|-------|---------|
| B1 | Kiến thức môi trường và sổ tay phân loại | `/kien-thuc`, `/kien-thuc/[slug]`, `/kien-thuc/so-tay` | Xong | Đủ 8 bài viết, tìm kiếm không dấu trong sổ tay 62 món |
| B2 | Quy tắc tính điểm công khai | `/diem-thuong/quy-tac` | Xong | Bảng quy tắc responsive, 3 trạng thái điểm, 5 FAQ chi tiết |
| B3 | Lịch sử điểm của tôi | `/diem-thuong` | Xong | Thẻ số dư lớn, 3 thẻ kiếm điểm, lịch sử lọc theo chip và nhóm theo tháng |
| B4 | Đổi điểm lấy quà xanh | `/doi-qua` | Xong | Lưới thẻ 3 trạng thái nút, modal xác nhận chuyển màn thành công hiển thị mã mono |
| B5 | Gian hàng doanh nghiệp xanh | `/gian-hang`, `/gian-hang/[slug]` | Xong | 8 gian hàng 8 quận, 4 đối tác đổi điểm, modal liên hệ, liên kết bản đồ |
| B6 | Khu trao đổi đồ tái sử dụng | `/trao-doi`, `/trao-doi/dang`, `/trao-doi/[id]` | Xong | Lọc tặng/đổi, form 4 bước kiểm lỗi focus, quản lý trạng thái và xóa tin |

## Dữ liệu
- Bài viết: 8 (theo chủ đề: phan-loai: 2, u-phan: 2, giam-rac: 2, tai-su-dung: 2) · Sổ tay: 62 món (theo nhóm: tai-che: 13, thuc-pham: 12, khac: 13, nguy-hai: 12, cong-kenh: 12)
- Gian hàng: 8 · Sản phẩm: 28 (mỗi gian hàng 3–4 sản phẩm)
- Ảnh: tổng 36 · tìm được ảnh thật: 36 (nguồn: Unsplash với giấy phép Unsplash License) · tự tạo: 0 (tất cả 36 ảnh đều tìm được ảnh chụp thật chất lượng cao, đúng nội dung và đã được cắt, nén chuẩn WebP <= 150KB)

## Lệnh kiểm tra (dán nguyên dòng kết quả cuối của mỗi lệnh)
- content:missing: ✓ Không thiếu ảnh nào (0).
- lint: > green-city@0.2.1 lint > eslint . (Thoát mã 0, không có lỗi hay cảnh báo)
- build: ✓ Generating static pages using 11 workers (48/48) in 696ms (Thành công 48/48 routes)
- features:smoke: ✓ TẤT CẢ ĐẠT.
- collab:check: ✓ ĐẠT — không có file nào nằm ngoài vùng được phép.

## Tiêu chí giao diện (9 câu, có/không + tên ảnh chụp)
1. Có — Trang mới nhìn cùng bộ với `/kham-pha` và `/dang-tin` về thẻ, nút bấm, cỡ chữ, khoảng cách đệm (ảnh `assets-src/features/_check/gemini/kien-thuc-1440-light.png`, `doi-qua-1440-light.png`, `trao-doi-1440-light.png`).
2. Có — Ở nền tối: chữ đọc rõ ràng, tương phản tốt, không có mảng trắng chói, không chữ xám trên nền xám (ảnh `assets-src/features/_check/gemini/kien-thuc-1440-dark.png`, `quy-tac-diem-1440-dark.png`, `doi-qua-1440-dark.png`, `gian-hang-1440-dark.png`, `trao-doi-1440-dark.png`).
3. Có — Ở 390px: không có cuộn ngang, nút đủ to đạt chuẩn trợ năng >= 44px, không bị thanh điều hướng đáy che khuất (ảnh `assets-src/features/_check/gemini/kien-thuc-390-light.png`, `so-tay-390-light.png`, `trao-doi-dang-390-light.png`, `doi-qua-390-light.png`).
4. Có — Sổ tay: gõ "chai nhua" tìm ra ngay "Chai nhựa" nhờ thuật toán chuẩn hóa NFD và bỏ dấu (ảnh `assets-src/features/_check/gemini/luong-so-tay-tim.png`).
5. Có — Đổi quà: khi thiếu điểm, nút bị vô hiệu hóa kèm nhãn "Cần thêm N điểm", khi hết hàng ghi "Tạm hết"; đổi xong hiển thị mã nhận quà dạng mono `GC-XXXX-XXXX` (ảnh `assets-src/features/_check/gemini/doi-qua-1440-light.png`, `luong-doi-qua.png`).
6. Có — Trao đổi: để trống form rồi bấm đăng thì báo lỗi hiển thị đúng từng ô sai và con trỏ focus nhảy vào ô sai đầu tiên (ảnh `assets-src/features/_check/gemini/luong-trao-doi-loi.png`).
7. Có — Không còn bất kỳ chữ "Đang xây dựng" nào trên các view, không sử dụng emoji, không dùng gradient màu mè, không có số liệu bịa (toàn bộ 44 ảnh chụp kiểm thử).
8. Có — Mọi ảnh đều đúng chủ đề thực tế, trông như ảnh chụp thật tự nhiên, không có ảnh hỏng, không có khung xám trống, không watermark hay nhãn hiệu thương mại nổi bật (toàn bộ 36 ảnh WebP).
9. Có — `public/content/NGUON-ANH.md` có đầy đủ 36 dòng cho 36 ảnh, ghi rõ nguồn Unsplash, tác giả, giấy phép Unsplash License, link gốc và mô tả chỉnh sửa.

## Yêu cầu đã gửi Claude
Không có

## Khác biệt giữa prompt và contracts.ts
Không có (contracts.ts có thêm trường note trong PointEntry và đã được hiển thị đầy đủ trong lịch sử điểm).

## Commit (dán kết quả `git log --oneline --grep="^\[gemini\]" nen-mong..HEAD`)
f2f9743 [gemini] sua loi do dai file, token mau, do dai bai viet va tro nang
ec4ca05 [gemini] báo cáo
47a4117 [gemini] hoan thien kieu du lieu va lien ket component
c7db03f [gemini] ảnh nội dung
3a412bf [gemini] B6: khu trao doi do tai su dung
4e76009 [gemini] B5: gian hang doanh nghiep xanh
5b0b81e [gemini] B4: doi diem lay qua xanh
3203716 [gemini] B3: lich su diem cua toi
01bf3f9 [gemini] B2: quy tac tinh diem cong khai
aa76afe [gemini] B1: kien thuc va so tay phan loai
