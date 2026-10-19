/**
 * KHUNG nhận diện ảnh phân loại rác bằng AI — CHƯA gọi model nào.
 * Bật: CONSULT_AI_ENABLED=on và ANTHROPIC_API_KEY trên server, NEXT_PUBLIC_CONSULT_AI=on phía trình duyệt.
 * Cách cài đặt phần gọi model: xem docs/tu-van-ai.md.
 */
export async function POST() {
  const enabled = process.env.CONSULT_AI_ENABLED === "on" && !!process.env.ANTHROPIC_API_KEY;
  if (!enabled) return Response.json({ error: "ai_disabled" }, { status: 503 });
  // Đã bật cờ nhưng phần gọi model chưa được cài — xem docs/tu-van-ai.md, mục "Cài phần gọi model".
  return Response.json({ error: "not_implemented" }, { status: 501 });
}
