// Images are kept inside the note so they work without file storage. They are
// shrunk first: the longest side to 1600px, re-encoded as WebP where the
// browser supports it.
const MAX_SIDE = 1600;
export const MAX_IMAGE_BYTES = 1.5 * 1024 * 1024;

export class ImageTooLargeError extends Error {}

export function dataUrlBytes(dataUrl: string) {
  const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
  return Math.floor((base64.length * 3) / 4);
}

export async function imageToDataUrl(file: File) {
  if (!file.type.startsWith("image/")) throw new ImageTooLargeError();
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const dataUrl = canvas.toDataURL("image/webp", 0.85);
  if (dataUrlBytes(dataUrl) > MAX_IMAGE_BYTES) throw new ImageTooLargeError();
  return dataUrl;
}
