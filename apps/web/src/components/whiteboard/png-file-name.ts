// Characters Windows and macOS refuse in file names are dropped so the export
// downloads under the project's name on every system.
export function pngFileName(title: string) {
  const safe = title
    .replace(/[\\/:*?"<>|]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return `${safe || "whiteboard"}.png`;
}
