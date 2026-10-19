# Yêu cầu của Gemini gửi Claude

Gemini ghi yêu cầu xuống cuối file theo mẫu dưới, không xóa yêu cầu cũ.
Claude đọc file này sau mỗi tính năng, xử lý, rồi trả lời trong `docs/collab/claude-thong-bao.md`.

```
## YC-<số> · <tiêu đề ngắn>
- Tính năng: B<số>
- Cần gì: <cụ thể: tên trường, kiểu dữ liệu, tên hàm, chữ ký hàm>
- Vì sao: <không có thì giao diện thiếu gì>
- Tạm thời: <giao diện đang xử lý ra sao khi chưa có, ví dụ: ẩn nút đó>
- Trạng thái: chờ Claude
```

---
