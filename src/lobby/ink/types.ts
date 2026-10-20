export interface InkStroke {
  /** đường tâm nét bút (path tương đối) */
  d: string;
  len: number;
  /** body = thân chữ (kể cả dấu mũ), mark = dấu thanh / chấm, viết sau cả từ */
  kind: "body" | "mark";
  glyph: number;
}

export interface InkGlyph {
  char: string;
  box: [number, number, number, number]; // x0, y0(trên), x1, y1(dưới)
}

export interface InkWord {
  text: string;
  width: number;
  glyphs: InkGlyph[];
  /** đường viền cả từ — để tô mực và cắt ảnh lá */
  outline: string;
  strokes: InkStroke[];
}

export interface InkHeadingData {
  id: string;
  text: string;
  upm: number;
  ascender: number;
  descender: number;
  words: InkWord[];
}
