# Tư vấn phân loại: bật nhận diện ảnh bằng AI

Hiện tại trang `/tu-van-phan-loai` chỉ dùng **gợi ý theo từ khóa** (so tên món với Sổ tay phân loại) và **người thật trả lời** (cộng tác viên hoặc vận hành). Khung cho AI đã có sẵn nhưng **mặc định tắt**. Người dùng chốt cách làm này ngày 2026-10-19.

## Khung đã có

| File | Vai trò |
|---|---|
| `src/lib/consult/types.ts` | `ClassifyInput` (ảnh data URL, mô tả), `ClassifyResult` (nhóm rác, tên món, hướng dẫn, độ tin cậy, nguồn) |
| `src/lib/consult/providers/keyword.ts` | Provider đang chạy: so khớp từ khóa với `SORTING_GUIDE` |
| `src/lib/consult/providers/ai.ts` | Provider AI: gọi `POST /api/tu-van-phan-loai`. Khi tắt thì trả rỗng, không gọi mạng |
| `src/lib/consult/config.ts` | Cờ `CONSULT_AI_ENABLED` đọc từ `NEXT_PUBLIC_CONSULT_AI` |
| `src/lib/consult/classify.ts` | Chạy lần lượt các provider đang bật, gộp kết quả (AI trước), tối đa 3 gợi ý |
| `src/app/api/tu-van-phan-loai/route.ts` | Route khung: chưa bật thì trả `503 ai_disabled`, đã bật nhưng chưa cài thì `501 not_implemented` |

Giao diện không phải sửa: kết quả AI hiện chung trong khối "Gợi ý từ sổ tay", nhãn đổi thành "Nhận diện ảnh tự động: đang bật".

## Bật lên khi app chạy thật

1. **Cài SDK** (chỉ dùng ở server): `npm install @anthropic-ai/sdk`.
2. **Đặt biến môi trường** trên máy chủ (ví dụ trong Vercel → Settings → Environment Variables):
   - `ANTHROPIC_API_KEY` — khóa API. **Chỉ đặt ở server**, không bao giờ đặt tên bắt đầu bằng `NEXT_PUBLIC_`, vì biến `NEXT_PUBLIC_` bị đóng gói vào mã chạy trên trình duyệt và ai cũng đọc được.
   - `CONSULT_AI_ENABLED=on` — bật route ở server.
   - `NEXT_PUBLIC_CONSULT_AI=on` — bật provider AI ở trình duyệt.
3. **Cài phần gọi model** trong `route.ts`, thay dòng trả `501`:
   - Đọc `{ imageDataUrl, description }` từ body, tách phần base64 và kiểu ảnh từ data URL.
   - Gửi ảnh và mô tả cho một model Claude **đọc được ảnh**. Tra tài liệu Anthropic để chọn model mới nhất phù hợp vào lúc triển khai, không chép tên model từ ghi chú cũ.
   - Yêu cầu model trả JSON đúng dạng `ClassifyResult[]`, với `group` thuộc 5 nhóm `tai-che | thuc-pham | khac | nguy-hai | cong-kenh`. Kiểm tra lại dữ liệu trả về trước khi gửi cho trình duyệt.
   - Trả `Response.json({ results })`.
4. **Giới hạn để kiểm soát chi phí**:
   - Ảnh đã được nén ở trình duyệt (tối đa 800px, JPEG 0.72, khoảng 60–90KB). Route nên từ chối ảnh lớn hơn 1MB.
   - Giới hạn số lần gọi mỗi người dùng mỗi ngày, và đặt hạn mức chi tiêu trong trang quản lý API.
   - Gợi ý AI chỉ là gợi ý: phiếu tư vấn vẫn chuyển cho người thật như hiện tại.

## Vì sao khóa API chỉ được nằm ở server

Trang tư vấn chạy trong trình duyệt của người dùng. Bất cứ thứ gì gửi xuống trình duyệt (kể cả biến `NEXT_PUBLIC_…`) đều xem được bằng công cụ của trình duyệt. Lộ khóa API thì người khác dùng được tài khoản và tiền của dự án. Vì vậy trình duyệt chỉ gọi route `/api/tu-van-phan-loai` của chính app, còn route mới là nơi cầm khóa và gọi model.
