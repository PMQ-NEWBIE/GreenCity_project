import type { InkId } from "./sources";
import type { InkSpriteKey } from "./sprites";

/**
 * Cây quanh chữ. u, v = vị trí trong bbox của glyph (u: 0 trái → 1 phải; v: 0 đáy → 1 đỉnh).
 * angle: độ, theo chiều kim đồng hồ (0 = mọc thẳng lên / lá vắt rủ thẳng xuống).
 * size: cạnh ảnh, tính bằng em. layer back = sau chữ, front = trước chữ.
 * lite: vẫn hiện trên điện thoại. sway: đung đưa nhẹ sau intro (chỉ hero, máy tính).
 * Thứ tự trong mảng = thứ tự mọc trong cùng một từ.
 *
 * Lá vắt (leaf-drape-*): đặt v = 1 lên NÉT ĐỨNG của chữ có đỉnh phẳng (l, h, b, k, d…): cuống nằm trên
 * đỉnh chữ, phiến rủ xuống trước mặt chữ. Chỉ phủ phần trên của nét đứng nên chữ vẫn đọc được.
 * u của nét đứng: l 0.5 · h, b, k 0.17.
 * KHÔNG đặt hoa/lá trước chữ lên glyph có dấu (ồ, ả, ầ, i…): sẽ che dấu thanh, đọc sai chữ.
 */
export interface InkPlantSpec {
  word: string;
  char: string;
  nth?: number;
  u: number;
  v: number;
  angle: number;
  size: number;
  sprite: InkSpriteKey;
  layer: "back" | "front";
  lite?: boolean;
  sway?: boolean;
}

export const INK_PLANTS: Partial<Record<InkId, InkPlantSpec[]>> = {
  hero: [
    // Hoa nở ở đỉnh chữ, có lá đỡ phía sau
    { word: "Đồ", char: "Đ", u: 0.14, v: 1, angle: -40, size: 0.3, sprite: "leaf-trau", layer: "back" },
    { word: "Đồ", char: "Đ", u: 0.14, v: 1.12, angle: 0, size: 0.4, sprite: "flower-su", layer: "front", lite: true },
    { word: "nhà", char: "h", u: 0.3, v: 1, angle: 35, size: 0.28, sprite: "leaf-xoai", layer: "back" },
    { word: "nhà", char: "h", u: 0.3, v: 1.12, angle: 0, size: 0.3, sprite: "flower-lai", layer: "front" },
    // Lá vắt qua đỉnh nét đứng, rủ xuống trước mặt chữ
    { word: "bạn", char: "b", u: 0.17, v: 1, angle: 3, size: 0.6, sprite: "leaf-drape-trau", layer: "front", sway: true },
    { word: "phải", char: "h", u: 0.3, v: 1, angle: -38, size: 0.28, sprite: "leaf-trau", layer: "back" },
    { word: "phải", char: "h", u: 0.3, v: 1.12, angle: 0, size: 0.34, sprite: "flower-su", layer: "front" },
    { word: "là", char: "l", u: 0.5, v: 1, angle: -2, size: 0.58, sprite: "leaf-drape-trau", layer: "front", lite: true, sway: true },
    // Dấu chấm là hạt giống — mầm mọc sau cùng
    { word: "rác.", char: ".", u: 0.5, v: 1, angle: 0, size: 0.4, sprite: "sprout", layer: "front" },
  ],
  features: [
    { word: "bạn", char: "b", u: 0.17, v: 1, angle: -36, size: 0.3, sprite: "leaf-trau", layer: "back" },
    { word: "bạn", char: "b", u: 0.17, v: 1.12, angle: 0, size: 0.36, sprite: "flower-su", layer: "front" },
    { word: "làm", char: "l", u: 0.5, v: 1, angle: 2, size: 0.58, sprite: "leaf-drape-trau", layer: "front", lite: true },
    { word: "hôm", char: "h", u: 0.17, v: 1, angle: -3, size: 0.6, sprite: "leaf-drape-trau", layer: "front" },
  ],
  "feature-1": [
    { word: "phút", char: "h", u: 0.17, v: 1, angle: 2, size: 0.6, sprite: "leaf-drape-trau", layer: "front", lite: true },
    { word: "phút", char: "t", u: 0.5, v: 1, angle: 4, size: 0.9, sprite: "sprout", layer: "front", lite: true },
  ],
  "feature-2": [
    { word: "loại,", char: "l", u: 0.5, v: 1, angle: -2, size: 0.58, sprite: "leaf-drape-trau", layer: "front", lite: true },
    // Cụm ở đỉnh chữ "k" (không dấu); hoa nhô hẳn lên trên để không che nét chữ
    { word: "khu", char: "k", u: 0.3, v: 1.05, angle: -46, size: 0.66, sprite: "leaf-xoai", layer: "back", lite: true },
    { word: "khu", char: "k", u: 0.3, v: 1.05, angle: 40, size: 0.62, sprite: "leaf-trau", layer: "back", lite: true },
    { word: "khu", char: "k", u: 0.3, v: 1.4, angle: 0, size: 0.66, sprite: "flower-su", layer: "front", lite: true },
  ],
  "feature-3": [
    // Đầu câu, trên chữ "G" — xa mọi dấu thanh
    { word: "Gọi", char: "G", u: 0.25, v: 1.0, angle: -24, size: 0.8, sprite: "leaf-trau", layer: "back", lite: true },
    { word: "Gọi", char: "G", u: 0.25, v: 1.0, angle: 28, size: 0.72, sprite: "leaf-xoai", layer: "back", lite: true },
    { word: "Gọi", char: "G", u: 0.25, v: 1.35, angle: 0, size: 0.52, sprite: "flower-lai", layer: "front", lite: true },
    { word: "nhà", char: "h", u: 0.17, v: 1, angle: 3, size: 0.6, sprite: "leaf-drape-trau", layer: "front", lite: true },
  ],
  cta: [
    { word: "Nhà", char: "N", u: 0.12, v: 1, angle: -36, size: 0.42, sprite: "leaf-trau", layer: "back", lite: true },
    { word: "Nhà", char: "N", u: 0.12, v: 1.12, angle: 0, size: 0.4, sprite: "flower-su", layer: "front", lite: true },
    { word: "bạn", char: "b", u: 0.17, v: 1, angle: 3, size: 0.6, sprite: "leaf-drape-trau", layer: "front", lite: true },
    { word: "đang", char: "đ", u: 0.6, v: 1, angle: 30, size: 0.36, sprite: "leaf-xoai", layer: "back" },
    { word: "đang", char: "đ", u: 0.6, v: 1.12, angle: 0, size: 0.32, sprite: "flower-lai", layer: "front" },
    { word: "dọn?", char: "?", u: 0.5, v: 0.05, angle: 0, size: 0.34, sprite: "flower-su", layer: "front", lite: true },
  ],
};
