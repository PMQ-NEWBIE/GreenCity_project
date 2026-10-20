import { Fragment, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import type { InkId } from "./sources";
import type { InkWord } from "./types";
import { INK_HEADINGS } from "./glyphs.generated";
import { INK_LEAFY, INK_PEN, type InkVariant } from "./config";
import { INK_DRAPE_FOLD, INK_FOLIAGE, INK_SPRITES, type InkSpriteKey } from "./sprites";
import { INK_PLANTS, type InkPlantSpec } from "./plants";

export interface InkHeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: "h1" | "h2" | "h3" | "span";
  inkId: InkId;
  variant: InkVariant;
}

/** Ảnh lá phủ lòng chữ: cùng một cỡ cho mọi từ (lá to bằng nhau), mỗi từ lấy một vùng khác nhau */
const TEX_W = 3000;
const TEX_H = 1500;

interface PlaceProps {
  x: number;
  y: number;
  angle: number;
  sizeEm: number;
  sprite: InkSpriteKey;
  upm: number;
  order: number;
  lite?: boolean;
  sway?: boolean;
}

/** Một cây: lớp ngoài đặt vị trí + góc, lớp trong để GSAP xoay/phóng quanh điểm tựa (0,0) */
function Plant({ x, y, angle, sizeEm, sprite: key, upm, order, lite, sway }: PlaceProps) {
  const sprite = INK_SPRITES[key];
  const s = sizeEm * upm;
  const iy = sprite.pivot === "center" ? -s / 2 : sprite.pivot === "fold" ? -s * INK_DRAPE_FOLD : -s;
  return (
    <g transform={`translate(${Math.round(x)} ${Math.round(y)}) rotate(${angle})`}>
      <g
        data-ink-plant
        data-kind={sprite.kind}
        data-order={order}
        data-lite={lite ? "" : undefined}
        data-sway={sway ? "" : undefined}
      >
        <image href={sprite.src} x={-s / 2} y={Math.round(iy)} width={s} height={s} />
      </g>
    </g>
  );
}

function plantAt(w: InkWord, p: InkPlantSpec, order: number, upm: number) {
  const glyph = w.glyphs.filter((g) => g.char === p.char)[p.nth ?? 0];
  if (!glyph) return null;
  const [x0, y0, x1, y1] = glyph.box;
  return (
    <Plant
      key={`p${order}`}
      x={x0 + p.u * (x1 - x0)}
      y={y1 - p.v * (y1 - y0)}
      angle={p.angle}
      sizeEm={p.size}
      sprite={p.sprite}
      upm={upm}
      order={order}
      lite={p.lite}
      sway={p.sway}
    />
  );
}

/**
 * Tiêu đề chữ lá. Mỗi từ là một SVG gồm (từ dưới lên):
 *   cây sau chữ → mực (thân chữ lộ ra theo ngòi bút, mask "pen") → lá phủ lòng chữ (lộ ra theo các chồi lá,
 *   mask "grow") → cây trước chữ.
 * HTML server render ra trạng thái CUỐI (nét đủ, lá phủ kín nhờ rect [data-ink-full], cây đủ);
 * animations/ink.ts ẩn đi rồi viết lại, và tự thêm các chồi lá vào [data-ink-buds].
 */
export function InkHeading({ as: Tag = "h2", inkId, variant, className, ...rest }: InkHeadingProps) {
  const h = INK_HEADINGS[inkId];
  const { upm, ascender, descender } = h;
  const H = ascender - descender; // descender âm
  const plants = INK_PLANTS[inkId] ?? [];
  const leafy = INK_LEAFY[variant];
  const box = { x: -upm, y: -ascender - upm, width: 0, height: H + 2 * upm };

  return (
    <Tag {...rest} data-ink={inkId} data-ink-variant={variant} className={cn("relative", className)}>
      <span className="sr-only">{h.text}</span>
      <span aria-hidden="true">
        {h.words.map((w, wi) => {
          const id = `ink-${inkId}-w${wi}`;
          const area = { ...box, width: w.width + 2 * upm };
          const mine = plants.map((p, i) => [p, i] as const).filter(([p]) => p.word === w.text);
          const layer = (l: InkPlantSpec["layer"]) =>
            mine.filter(([p]) => p.layer === l).map(([p, i]) => plantAt(w, p, i, upm));
          const texX = -((wi * 431 + inkId.length * 197) % Math.max(1, TEX_W - w.width));

          return (
            <Fragment key={wi}>
              {wi > 0 && " "}
              <svg
                data-ink-word={wi}
                viewBox={`0 ${-ascender} ${w.width} ${H}`}
                style={{
                  display: "inline-block",
                  overflow: "visible",
                  width: `${w.width / upm}em`,
                  height: `${H / upm}em`,
                  verticalAlign: `${descender / upm}em`,
                  marginTop: `${-H / upm}em`, // hộp margin cao 0 → giữ đúng line-height của thẻ
                }}
              >
                <defs>
                  <mask id={`${id}-pen`} maskUnits="userSpaceOnUse" {...area}>
                    <g fill="none" stroke="#fff" strokeWidth={INK_PEN} strokeLinecap="round" strokeLinejoin="round">
                      {w.strokes.map((s, i) => (
                        <path key={i} d={s.d} pathLength={1} data-ink-stroke data-kind={s.kind} data-len={s.len} data-glyph={s.glyph} />
                      ))}
                    </g>
                  </mask>
                  <clipPath id={`${id}-clip`}>
                    <path d={w.outline} />
                  </clipPath>
                  <mask id={`${id}-grow`} maskUnits="userSpaceOnUse" {...area}>
                    <g data-ink-buds fill="#fff" />
                    <rect data-ink-full {...area} fill="#fff" />
                  </mask>
                  {/* 3D: ánh sáng từ trên-phải → mép trên-phải sáng, mép dưới-trái tối, bóng đổ xuống-trái.
                      Đơn vị: đơn vị font. Nội dung bên trong đứng yên nên trình duyệt chỉ tính bộ lọc một lần. */}
                  <filter id={`${id}-bevel`} x="-10%" y="-10%" width="125%" height="135%" colorInterpolationFilters="sRGB">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="16" result="blur" />
                    <feOffset in="blur" dx="-10" dy="26" result="dropOff" />
                    <feFlood floodColor="#06200d" floodOpacity={leafy.dropShadow} />
                    <feComposite in2="dropOff" operator="in" result="drop" />
                    <feOffset in="blur" dx="14" dy="-22" result="shOff" />
                    <feComposite in="SourceAlpha" in2="shOff" operator="out" result="shMask" />
                    <feFlood floodColor="#06200d" floodOpacity="0.7" />
                    <feComposite in2="shMask" operator="in" result="shade" />
                    <feOffset in="blur" dx="-10" dy="14" result="hiOff" />
                    <feComposite in="SourceAlpha" in2="hiOff" operator="out" result="hiMask" />
                    <feFlood floodColor="#f3f9ee" floodOpacity="0.42" />
                    <feComposite in2="hiMask" operator="in" result="hi" />
                    <feMerge>
                      <feMergeNode in="drop" />
                      <feMergeNode in="SourceGraphic" />
                      <feMergeNode in="shade" />
                      <feMergeNode in="hi" />
                    </feMerge>
                  </filter>
                </defs>

                <g data-ink-back>{layer("back")}</g>
                <g data-ink-fill mask={`url(#${id}-pen)`}>
                  <path d={w.outline} fill="currentColor" />
                </g>
                <g data-ink-leaves mask={`url(#${id}-grow)`}>
                  <g filter={`url(#${id}-bevel)`}>
                    <g clipPath={`url(#${id}-clip)`}>
                      <image
                        href={INK_FOLIAGE[leafy.foliage].src}
                        x={texX}
                        y={-ascender - 120}
                        width={TEX_W}
                        height={TEX_H}
                        preserveAspectRatio="xMidYMid slice"
                      />
                    </g>
                  </g>
                </g>
                <g data-ink-front>{layer("front")}</g>
              </svg>
            </Fragment>
          );
        })}
      </span>
      {process.env.NEXT_PUBLIC_INK_DEBUG === "1" && (
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 text-red-600/40">
          {h.text}
        </span>
      )}
    </Tag>
  );
}
