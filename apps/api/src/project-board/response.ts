import { nullableResponseTimestamp, responseTimestamp, z } from "../openapi";
import { projectBoardSceneSchema } from "./schema";

const boardEditorSchema = z
  .object({ id: z.string(), name: z.string() })
  .nullable()
  .openapi({ description: "Who saved, or null if that account was deleted." });

export const projectBoardSchema = z
  .object({
    projectId: z.string(),
    scene: projectBoardSceneSchema.nullable().openapi({
      description: "Null until the board is saved for the first time.",
    }),
    version: z.number().int().openapi({
      description: "Grows by one on every save; 0 before the first save.",
    }),
    updatedAt: nullableResponseTimestamp,
    updatedBy: boardEditorSchema,
  })
  .openapi("ProjectBoard");

export const savedProjectBoardSchema = z
  .object({
    version: z.number().int(),
    updatedAt: responseTimestamp,
    overwritten: z
      .object({ updatedBy: boardEditorSchema, updatedAt: responseTimestamp })
      .nullable()
      .openapi({
        description:
          "Set when another person saved after `baseVersion`; their changes were replaced by this save.",
      }),
  })
  .openapi("SavedProjectBoard");
