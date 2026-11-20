import { responseTimestamp, z } from "../openapi";
import { projectNoteContentSchema } from "./schema";

const noteAuthorSchema = z
  .object({ id: z.string(), name: z.string() })
  .nullable()
  .openapi({ description: "The person, or null if that account was deleted." });

export const projectNoteSummarySchema = z
  .object({
    id: z.string(),
    projectId: z.string(),
    title: z.string(),
    version: z.number().int(),
    createdBy: noteAuthorSchema,
    updatedBy: noteAuthorSchema,
    createdAt: responseTimestamp,
    updatedAt: responseTimestamp,
  })
  .openapi("ProjectNoteSummary");

export const projectNoteSchema = projectNoteSummarySchema
  .extend({ content: projectNoteContentSchema })
  .openapi("ProjectNote");

export const savedProjectNoteSchema = z
  .object({
    version: z.number().int(),
    updatedAt: responseTimestamp,
    overwritten: z
      .object({ updatedBy: noteAuthorSchema, updatedAt: responseTimestamp })
      .nullable()
      .openapi({
        description:
          "Set when another person saved after `baseVersion`; their changes were replaced by this save.",
      }),
  })
  .openapi("SavedProjectNote");
