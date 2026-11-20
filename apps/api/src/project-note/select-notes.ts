import { eq, type SQL } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import db from "../database";
import { projectNoteTable, userTable } from "../database/schema";
import type { ProjectNoteContent } from "./schema";

const creator = alias(userTable, "note_creator");
const editor = alias(userTable, "note_editor");

function person(id: string | null, name: string | null) {
  return id ? { id, name: name ?? "" } : null;
}

const summaryColumns = {
  id: projectNoteTable.id,
  projectId: projectNoteTable.projectId,
  title: projectNoteTable.title,
  version: projectNoteTable.version,
  createdAt: projectNoteTable.createdAt,
  updatedAt: projectNoteTable.updatedAt,
  creatorId: creator.id,
  creatorName: creator.name,
  editorId: editor.id,
  editorName: editor.name,
};

type SummaryRow = {
  id: string;
  projectId: string;
  title: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  creatorId: string | null;
  creatorName: string | null;
  editorId: string | null;
  editorName: string | null;
};

function toSummary(row: SummaryRow) {
  return {
    id: row.id,
    projectId: row.projectId,
    title: row.title,
    version: row.version,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    createdBy: person(row.creatorId, row.creatorName),
    updatedBy: person(row.editorId, row.editorName),
  };
}

// Content is left out of lists; a note's document is read only when opened.
export async function selectNoteSummaries(where: SQL) {
  const rows = await db
    .select(summaryColumns)
    .from(projectNoteTable)
    .leftJoin(creator, eq(creator.id, projectNoteTable.createdBy))
    .leftJoin(editor, eq(editor.id, projectNoteTable.updatedBy))
    .where(where);
  return rows.map(toSummary);
}

export async function selectNote(id: string) {
  const [row] = await db
    .select({ ...summaryColumns, content: projectNoteTable.content })
    .from(projectNoteTable)
    .leftJoin(creator, eq(creator.id, projectNoteTable.createdBy))
    .leftJoin(editor, eq(editor.id, projectNoteTable.updatedBy))
    .where(eq(projectNoteTable.id, id))
    .limit(1);
  if (!row) return null;
  return {
    ...toSummary(row),
    content: row.content as ProjectNoteContent,
  };
}
