import { eq } from "drizzle-orm";
import db from "../../database";
import { projectBoardTable, userTable } from "../../database/schema";
import type { ProjectBoardScene } from "../schema";

async function getProjectBoard(projectId: string) {
  const [board] = await db
    .select({
      scene: projectBoardTable.scene,
      version: projectBoardTable.version,
      updatedAt: projectBoardTable.updatedAt,
      editorId: userTable.id,
      editorName: userTable.name,
    })
    .from(projectBoardTable)
    .leftJoin(userTable, eq(userTable.id, projectBoardTable.updatedBy))
    .where(eq(projectBoardTable.projectId, projectId))
    .limit(1);

  if (!board) {
    return {
      projectId,
      scene: null,
      version: 0,
      updatedAt: null,
      updatedBy: null,
    };
  }

  return {
    projectId,
    scene: board.scene as ProjectBoardScene,
    version: board.version,
    updatedAt: board.updatedAt,
    updatedBy: board.editorId
      ? { id: board.editorId, name: board.editorName ?? "" }
      : null,
  };
}

export default getProjectBoard;
