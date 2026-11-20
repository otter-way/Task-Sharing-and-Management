import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { pngFileName } from "./png-file-name";

// Exported at twice the scene size so text stays sharp when the image is
// printed or put on a slide. Always light, like a sheet of paper.
export async function exportBoardPng(
  api: ExcalidrawImperativeAPI,
  title: string,
) {
  const { exportToBlob } = await import("@excalidraw/excalidraw");
  const blob = await exportToBlob({
    elements: api.getSceneElements(),
    appState: {
      ...api.getAppState(),
      exportBackground: true,
      exportWithDarkMode: false,
    },
    files: api.getFiles(),
    mimeType: "image/png",
    exportPadding: 24,
    getDimensions: (width: number, height: number) => ({
      width: width * 2,
      height: height * 2,
      scale: 2,
    }),
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = pngFileName(title);
  // Firefox only follows a click on a link that is in the document.
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
