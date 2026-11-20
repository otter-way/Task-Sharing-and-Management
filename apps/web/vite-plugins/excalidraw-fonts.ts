import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { Plugin } from "vite";

// Excalidraw downloads its drawing fonts at runtime from a public CDN unless
// `window.EXCALIDRAW_ASSET_PATH` points at a copy. Serving them from the app
// keeps self-hosted installs free of that outside request. The page sets the
// asset path to `<base>excalidraw/`.
export const EXCALIDRAW_FONTS_PATH = "excalidraw/fonts";

// Xiaolai is the 13 MB CJK fallback. Leaving it out keeps the build small;
// Excalidraw still reaches its CDN for those glyphs when someone types them.
const SKIPPED_FAMILIES = new Set(["Xiaolai"]);

async function listFonts(fontsDir: string) {
  const entries = await readdir(fontsDir, { recursive: true });
  return entries
    .map((entry) => entry.split(path.sep).join("/"))
    .filter(
      (entry) =>
        entry.endsWith(".woff2") &&
        !SKIPPED_FAMILIES.has(entry.split("/")[0] ?? ""),
    );
}

export function excalidrawFonts(fontsDir: string): Plugin {
  return {
    name: "kaneo:excalidraw-fonts",
    configureServer(server) {
      server.middlewares.use(
        `/${EXCALIDRAW_FONTS_PATH}/`,
        async (req, res, next) => {
          const relative = decodeURIComponent(
            (req.url ?? "").split("?")[0] ?? "",
          ).replace(/^\/+/, "");
          const file = path.resolve(fontsDir, relative);
          const family = relative.split("/")[0] ?? "";
          if (
            !file.startsWith(fontsDir + path.sep) ||
            !file.endsWith(".woff2") ||
            SKIPPED_FAMILIES.has(family)
          ) {
            next();
            return;
          }
          try {
            const body = await readFile(file);
            res.setHeader("Content-Type", "font/woff2");
            res.end(body);
          } catch {
            next();
          }
        },
      );
    },
    async generateBundle() {
      for (const font of await listFonts(fontsDir)) {
        this.emitFile({
          type: "asset",
          fileName: `${EXCALIDRAW_FONTS_PATH}/${font}`,
          source: await readFile(path.join(fontsDir, font)),
        });
      }
    },
  };
}
