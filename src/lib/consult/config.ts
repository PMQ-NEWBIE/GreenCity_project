/**
 * Bật nhận diện ảnh bằng AI: đặt NEXT_PUBLIC_CONSULT_AI=on (phía trình duyệt) và
 * CONSULT_AI_ENABLED=on + ANTHROPIC_API_KEY (phía server). Xem docs/tu-van-ai.md.
 * Mặc định tắt: trang tư vấn chỉ dùng gợi ý theo từ khóa và người thật trả lời.
 */
export const CONSULT_AI_ENABLED = process.env.NEXT_PUBLIC_CONSULT_AI === "on";
