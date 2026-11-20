import { z } from "../openapi";

// Notes are saved whole on every autosave. Pasted images live inside the
// document, so the cap is what keeps one note from growing without bound.
export const MAX_PROJECT_NOTE_BYTES = 5 * 1024 * 1024;
export const MAX_PROJECT_NOTE_BLOCKS = 5_000;
export const MAX_PROJECT_NOTE_TITLE = 200;

export const projectNoteProjectParam = z.object({ projectId: z.string() });
export const projectNoteParam = z.object({ id: z.string() });

export const projectNoteContentSchema = z
  .array(z.record(z.string(), z.unknown()))
  .max(MAX_PROJECT_NOTE_BLOCKS)
  .openapi("ProjectNoteContent", {
    description: "The note's BlockNote block document, stored as sent.",
  });

const title = z.string().trim().max(MAX_PROJECT_NOTE_TITLE);

export const createProjectNoteBody = z.object({
  title: title.default(""),
  content: projectNoteContentSchema.default([]),
});

export const saveProjectNoteBody = z.object({
  baseVersion: z.number().int().min(1).openapi({
    description:
      "The note version the client last loaded or saved. A different stored version does not block the save; the response then names whose changes were replaced.",
  }),
  title,
  content: projectNoteContentSchema,
});

export type ProjectNoteContent = z.infer<typeof projectNoteContentSchema>;
