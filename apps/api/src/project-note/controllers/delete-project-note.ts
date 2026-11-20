import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import { projectNoteTable } from "../../database/schema";
import { publishEvent } from "../../events";

// People may delete their own notes; anyone else's needs task:delete, the
// permission that already guards deleting shared work.
async function deleteProjectNote({
  id,
  userId,
  canDeleteOthers,
}: {
  id: string;
  userId: string;
  canDeleteOthers: boolean;
}) {
  const note = await db.query.projectNoteTable.findFirst({
    where: eq(projectNoteTable.id, id),
    columns: { projectId: true, createdBy: true },
  });
  if (!note) throw new HTTPException(404, { message: "Note not found" });
  if (note.createdBy !== userId && !canDeleteOthers) {
    throw new HTTPException(403, {
      message:
        "Only the author or someone with task:delete can delete this note",
    });
  }

  await db.delete(projectNoteTable).where(eq(projectNoteTable.id, id));
  await publishEvent("project_note.updated", { projectId: note.projectId });
  return { success: true };
}

export default deleteProjectNote;
