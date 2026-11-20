import { z } from "../openapi";

// A board is saved whole on every autosave, so its size is capped well below
// the proxy's request limit. Pasted images are the usual way to reach it.
export const MAX_PROJECT_BOARD_BYTES = 5 * 1024 * 1024;
export const MAX_PROJECT_BOARD_ELEMENTS = 10_000;

export const projectBoardParam = z.object({ projectId: z.string() });

export const projectBoardSceneSchema = z
  .object({
    elements: z
      .array(z.record(z.string(), z.unknown()))
      .max(MAX_PROJECT_BOARD_ELEMENTS),
    appState: z.record(z.string(), z.unknown()).optional(),
    files: z.record(z.string(), z.unknown()).optional(),
  })
  .openapi("ProjectBoardScene", {
    description:
      "An Excalidraw scene. Elements, view settings, and embedded files are stored as sent.",
  });

export const saveProjectBoardBody = z.object({
  baseVersion: z.number().int().min(0).openapi({
    description:
      "The board version the client last loaded or saved, or 0 for a new board. A different stored version does not block the save; the response then names whose changes were replaced.",
  }),
  scene: projectBoardSceneSchema,
});

export type ProjectBoardScene = z.infer<typeof projectBoardSceneSchema>;
