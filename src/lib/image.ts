/**
 * Thu nhỏ ảnh về tối đa `maxSize` px và mã hóa JPEG dạng data URL — lưu được vào
 * localStorage và còn hiển thị sau khi tải lại trang (blob: URL thì không).
 * Mặc định 800px / 0.72 ≈ 60–90KB mỗi ảnh để bộ nhớ trình duyệt (~5MB) đủ chỗ.
 */
export async function compressImage(file: File, maxSize = 800, quality = 0.72): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D không khả dụng");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", quality);
}
