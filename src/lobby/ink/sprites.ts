/**
 * Ảnh cây cho tiêu đề chữ lá — sinh bởi `npm run ink:sprites` từ ảnh chụp thật trong assets-src/ink/.
 * pivot: base = cuống ở giữa mép dưới (mọc lên) · center = tâm hoa · fold = nếp gập của lá vắt
 * (dòng INK_DRAPE_FOLD của ảnh, đặt đúng lên mép trên của chữ).
 */
export const INK_SPRITES = {
  "leaf-trau": { src: "/lobby/ink/leaf-trau.webp", kind: "leaf", pivot: "base", maxKB: 32 },
  "leaf-xoai": { src: "/lobby/ink/leaf-xoai.webp", kind: "leaf", pivot: "base", maxKB: 32 },
  "leaf-drape-trau": { src: "/lobby/ink/leaf-drape-trau.webp", kind: "drape", pivot: "fold", maxKB: 32 },
  "flower-su": { src: "/lobby/ink/flower-su.webp", kind: "flower", pivot: "center", maxKB: 32 },
  "flower-lai": { src: "/lobby/ink/flower-lai.webp", kind: "flower", pivot: "center", maxKB: 32 },
  sprout: { src: "/lobby/ink/sprout.webp", kind: "sprout", pivot: "base", maxKB: 32 },
} as const;

/** Nếp gập của lá vắt, tính theo chiều cao ảnh (56 / 384 — khớp DRAPE_FOLD trong scripts/ink-headings/sprites.mjs) */
export const INK_DRAPE_FOLD = 56 / 384;

/** Ảnh lá phủ lòng chữ (2048×1024): tối cho nền sáng, sáng cho nền tối */
export const INK_FOLIAGE = {
  dark: { src: "/lobby/ink/foliage-dark.webp", maxKB: 200 },
  light: { src: "/lobby/ink/foliage-light.webp", maxKB: 200 },
} as const;

export type InkSpriteKey = keyof typeof INK_SPRITES;
export type InkPlantKind = (typeof INK_SPRITES)[InkSpriteKey]["kind"];
export type InkPivot = (typeof INK_SPRITES)[InkSpriteKey]["pivot"];
