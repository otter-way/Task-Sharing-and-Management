import { HTTPException } from "hono/http-exception";
import db from "../../database";
import { projectNoteTable } from "../../database/schema";
import { publishEvent } from "../../events";
import type { ProjectNoteContent } from "../schema";
import { selectNote } from "../select-notes";
import { assertNoteSize } from "./assert-note-size";

async function createProjectNote({
  projectId,
  userId,
  title,
  content,
}: {
  projectId: string;
  userId: string;
  title: string;
  content: ProjectNoteContent;
}) {
  assertNoteSize(content);
  const [created] = await db
    .insert(projectNoteTable)
    .values({ projectId, title, content, createdBy: userId, updatedBy: userId })
    .returning({ id: projectNoteTable.id });
  const note = created && (await selectNote(created.id));
  if (!note) throw new HTTPException(500, { message: "Failed to create note" });

  await publishEvent("project_note.updated", { projectId });
  return note;
}

export default createProjectNote;
