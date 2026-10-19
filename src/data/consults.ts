import type { ConsultStatus, ConsultTicket } from "@/types/features";
import { IMAGES } from "./mock-data";

export const CONSULT_STATUS_LABEL: Record<ConsultStatus, string> = {
  "cho-tu-van": "Chờ tư vấn",
  "da-tra-loi": "Đã trả lời",
};

const ago = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();

/** Câu hỏi mẫu của người khác (dữ liệu minh họa) — cho hàng chờ của người tư vấn. */
export function consultsSeed(): ConsultTicket[] {
  return [
    {
      id: "tv-mau-1",
      userName: "Chị Vy",
      photo: IMAGES.electronic,
      description: "Bộ sạc điện thoại hỏng",
      question: "Bỏ chung với đồ điện tử cũ được không?",
      at: ago(2),
      status: "cho-tu-van",
      suggestions: [],
    },
    {
      id: "tv-mau-2",
      userName: "Anh Duy",
      photo: IMAGES.paper,
      description: "Hộp sữa giấy có lớp nhôm bên trong",
      question: "",
      at: ago(5),
      status: "cho-tu-van",
      suggestions: [],
    },
    {
      id: "tv-mau-3",
      userName: "Cô Mai",
      photo: IMAGES.glassBottles,
      description: "Lọ thủy tinh đựng thuốc ho",
      question: "Còn dính siro thì sao?",
      at: ago(30),
      status: "da-tra-loi",
      suggestions: [],
      answer: { group: "tai-che", guidance: "Tráng sạch siro bằng nước ấm, bỏ nắp nhựa riêng, để lọ vào túi thủy tinh.", by: "Chị Hằng", at: ago(26) },
    },
  ];
}
