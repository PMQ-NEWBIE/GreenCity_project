import type { ClassifyResult } from "@/types/features";

export type { ClassifyResult };

export interface ClassifyInput {
  /** Ảnh dạng data URL */
  imageDataUrl: string;
  description: string;
}

/** Mỗi cách nhận diện là một provider cùng giao diện — thêm AI sau này không phải sửa giao diện. */
export interface ClassifyProvider {
  name: ClassifyResult["source"];
  enabled: boolean;
  classify(input: ClassifyInput): Promise<ClassifyResult[]>;
}
