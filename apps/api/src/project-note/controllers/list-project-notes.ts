import { eq } from "drizzle-orm";
import { projectNoteTable } from "../../database/schema";
import { selectNoteSummaries } from "../select-notes";

async function listProjectNotes(projectId: string) {
  const notes = await selectNoteSummaries(
    eq(projectNoteTable.projectId, projectId),
  );
  // Most recently edited first, the order people look for notes in.
  return notes.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
}

export default listProjectNotes;
