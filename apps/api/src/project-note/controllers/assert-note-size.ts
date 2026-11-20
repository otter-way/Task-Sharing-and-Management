import { HTTPException } from "hono/http-exception";
import { MAX_PROJECT_NOTE_BYTES, type ProjectNoteContent } from "../schema";

export function assertNoteSize(content: ProjectNoteContent) {
  if (Buffer.byteLength(JSON.stringify(content)) > MAX_PROJECT_NOTE_BYTES) {
    throw new HTTPException(413, { message: "Note is too large" });
  }
}
