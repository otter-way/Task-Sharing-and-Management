import { eq, sql } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import { projectBoardTable, userTable } from "../../database/schema";
import { publishEvent } from "../../events";
import { MAX_PROJECT_BOARD_BYTES, type ProjectBoardScene } from "../schema";

async function saveProjectBoard({
  projectId,
  userId,
  baseVersion,
  scene,
}: {
  projectId: string;
  userId: string;
  baseVersion: number;
  scene: ProjectBoardScene;
}) {
  if (Buffer.byteLength(JSON.stringify(scene)) > MAX_PROJECT_BOARD_BYTES) {
    throw new HTTPException(413, { message: "Board is too large" });
  }

  const result = await db.transaction(async (tx) => {
    const [current] = await tx
      .select({
        version: projectBoardTable.version,
        updatedAt: projectBoardTable.updatedAt,
        editorId: projectBoardTable.updatedBy,
      })
      .from(projectBoardTable)
      .where(eq(projectBoardTable.projectId, projectId))
      .for("update");

    const [saved] = await tx
      .insert(projectBoardTable)
      .values({ projectId, scene, version: 1, updatedBy: userId })
      .onConflictDoUpdate({
        target: projectBoardTable.projectId,
        set: {
          scene,
          version: sql`${projectBoardTable.version} + 1`,
          updatedBy: userId,
          updatedAt: sql`(now() AT TIME ZONE 'utc')`,
        },
      })
      .returning({
        version: projectBoardTable.version,
        updatedAt: projectBoardTable.updatedAt,
      });

    if (!saved) {
      throw new HTTPException(500, { message: "Failed to save board" });
    }

    // Last save wins, but the saver hears whose newer work it replaced. Saves
    // from the same person (another tab) are not reported.
    const replacedSomeoneElse =
      current !== undefined &&
      current.version !== baseVersion &&
      current.editorId !== userId;

    if (!replacedSomeoneElse) return { ...saved, overwritten: null };

    const [editor] = current.editorId
      ? await tx
          .select({ id: userTable.id, name: userTable.name })
          .from(userTable)
          .where(eq(userTable.id, current.editorId))
          .limit(1)
      : [];

    return {
      ...saved,
      overwritten: {
        updatedBy: editor ?? null,
        updatedAt: current.updatedAt,
      },
    };
  });

  await publishEvent("project_board.updated", { projectId });

  return result;
}

export default saveProjectBoard;
