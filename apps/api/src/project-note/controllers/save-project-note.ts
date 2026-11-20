import { eq, sql } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import { projectNoteTable, userTable } from "../../database/schema";
import { publishEvent } from "../../events";
import type { ProjectNoteContent } from "../schema";
import { assertNoteSize } from "./assert-note-size";

async function saveProjectNote({
  id,
  userId,
  baseVersion,
  title,
  content,
}: {
  id: string;
  userId: string;
  baseVersion: number;
  title: string;
  content: ProjectNoteContent;
}) {
  assertNoteSize(content);

  const result = await db.transaction(async (tx) => {
    const [current] = await tx
      .select({
        projectId: projectNoteTable.projectId,
        version: projectNoteTable.version,
        updatedAt: projectNoteTable.updatedAt,
        editorId: projectNoteTable.updatedBy,
      })
      .from(projectNoteTable)
      .where(eq(projectNoteTable.id, id))
      .for("update");
    if (!current) throw new HTTPException(404, { message: "Note not found" });

    const [saved] = await tx
      .update(projectNoteTable)
      .set({
        title,
        content,
        version: sql`${projectNoteTable.version} + 1`,
        updatedBy: userId,
        updatedAt: sql`(now() AT TIME ZONE 'utc')`,
      })
      .where(eq(projectNoteTable.id, id))
      .returning({
        version: projectNoteTable.version,
        updatedAt: projectNoteTable.updatedAt,
      });
    if (!saved)
      throw new HTTPException(500, { message: "Failed to save note" });

    // Last save wins, but the saver hears whose newer work it replaced. Saves
    // from the same person (another tab) are not reported.
    const replacedSomeoneElse =
      current.version !== baseVersion && current.editorId !== userId;
    if (!replacedSomeoneElse) {
      return { projectId: current.projectId, saved, overwritten: null };
    }

    const [editor] = current.editorId
      ? await tx
          .select({ id: userTable.id, name: userTable.name })
          .from(userTable)
          .where(eq(userTable.id, current.editorId))
          .limit(1)
      : [];
    return {
      projectId: current.projectId,
      saved,
      overwritten: { updatedBy: editor ?? null, updatedAt: current.updatedAt },
    };
  });

  await publishEvent("project_note.updated", { projectId: result.projectId });
  return { ...result.saved, overwritten: result.overwritten };
}

export default saveProjectNote;
