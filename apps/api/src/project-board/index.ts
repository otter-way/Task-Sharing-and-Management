import {
  apiRouter,
  createRoute,
  errorResponse,
  jsonResponse,
} from "../openapi";
import { requireWorkspacePermission } from "../utils/require-workspace-permission";
import { workspaceAccess } from "../utils/workspace-access-middleware";
import getProjectBoard from "./controllers/get-project-board";
import saveProjectBoard from "./controllers/save-project-board";
import { projectBoardSchema, savedProjectBoardSchema } from "./response";
import { projectBoardParam, saveProjectBoardBody } from "./schema";

const getProjectBoardRoute = createRoute({
  method: "get",
  operationId: "getProjectBoard",
  path: "/{projectId}",
  tags: ["Project boards"],
  summary: "Get project whiteboard",
  description:
    "Get the project's brainstorming whiteboard. A project without a saved board returns version 0 and a null scene.",
  middleware: [
    workspaceAccess.fromProject("projectId"),
    requireWorkspacePermission({ project: ["read"] }),
  ] as const,
  request: { params: projectBoardParam },
  responses: {
    200: jsonResponse("The project whiteboard", projectBoardSchema),
    403: errorResponse("No access to the project, or missing read permission"),
    404: errorResponse("Project not found"),
  },
});

const saveProjectBoardRoute = createRoute({
  method: "put",
  operationId: "saveProjectBoard",
  path: "/{projectId}",
  tags: ["Project boards"],
  summary: "Save project whiteboard",
  description:
    "Replace the project's whiteboard. The last save wins: a save based on an older version still succeeds and reports whose changes it replaced. Requires task:update permission. Scenes larger than 5 MB are refused.",
  middleware: [
    workspaceAccess.fromProject("projectId"),
    requireWorkspacePermission({ task: ["update"] }),
  ] as const,
  request: {
    params: projectBoardParam,
    body: {
      required: true,
      content: { "application/json": { schema: saveProjectBoardBody } },
    },
  },
  responses: {
    200: jsonResponse("The saved board version", savedProjectBoardSchema),
    400: errorResponse("Invalid body"),
    403: errorResponse(
      "No access to the project, or missing task:update permission",
    ),
    404: errorResponse("Project not found"),
    413: errorResponse("The board is larger than 5 MB"),
  },
});

const projectBoard = apiRouter()
  .openapi(getProjectBoardRoute, async (c) => {
    c.header("Cache-Control", "private, no-store");
    return c.json(await getProjectBoard(c.req.valid("param").projectId), 200);
  })
  .openapi(saveProjectBoardRoute, async (c) => {
    const { baseVersion, scene } = c.req.valid("json");
    return c.json(
      await saveProjectBoard({
        projectId: c.req.valid("param").projectId,
        userId: c.get("userId"),
        baseVersion,
        scene,
      }),
      200,
    );
  });

export default projectBoard;
