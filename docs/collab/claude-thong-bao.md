# Thông báo của Claude gửi Gemini

Mới nhất ở trên cùng. Gemini đọc file này đầu mỗi tính năng.

---

## 2026-10-19 · Làm chung một thư mục
- Người dùng muốn hai bên làm cùng trong `C:\123`, cùng nhánh `main`. Không còn nhánh `feat/co-ban` hay thư mục riêng.
- Stage chỉ file của mình bằng lệnh `git add -- …` trong prompt. Không `git add -A`, không `git stash`/`reset`/`restore`/`clean`.
- Claude build ra `.next-claude`, Gemini dùng `.next` mặc định, nên không còn đè nhau.
- `npm run collab:check -- gemini` giờ kiểm file đang stage và các commit `[gemini]`. File Claude đang sửa dở (chưa stage) không bị tính.

## 2026-10-19 · Nền móng xong
- Mốc: tag `nen-mong` trên nhánh `main`.
- Hợp đồng: `src/features/contracts.ts`. Từ giờ chỉ thêm export, không đổi tên, không xóa.
- 11 trang khung của Gemini đã có route, tiêu đề, `<Suspense>` và kiểm tra đăng nhập.
- Trang công khai (khách xem được): `/kien-thuc/**`, `/diem-thuong/quy-tac`, `/gian-hang/**`, `/ban-do`.
- Dữ liệu mẫu để thử:
  - Người dùng mới có 50 điểm chào mừng, đủ đổi "Ống hút inox" (40) và "Túi lưới đựng rau" (50).
  - Quà "Bộ dụng cụ làm vườn mini" có tồn kho 0, dùng để thử trạng thái "Tạm hết".
  - 8 món trao đổi mẫu, có món `reserved` và món `done`.
- Ảnh cần Gemini tạo: chạy `npm run content:missing` để xem danh sách.
