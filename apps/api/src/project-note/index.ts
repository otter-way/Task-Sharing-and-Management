import { HTTPException } from "hono/http-exception";
import {
  apiRouter,
  createRoute,
  errorResponse,
  jsonResponse,
  z,
} from "../openapi";
import {
  hasWorkspacePermission,
  requireWorkspacePermission,
} from "../utils/require-workspace-permission";
import { workspaceAccess } from "../utils/workspace-access-middleware";
import createProjectNote from "./controllers/create-project-note";
import deleteProjectNote from "./controllers/delete-project-note";
import listProjectNotes from "./controllers/list-project-notes";
import saveProjectNote from "./controllers/save-project-note";
import {
  projectNoteSchema,
  projectNoteSummarySchema,
  savedProjectNoteSchema,
} from "./response";
import {
  createProjectNoteBody,
  projectNoteParam,
  projectNoteProjectParam,
  saveProjectNoteBody,
} from "./schema";
import { selectNote } from "./select-notes";

const readProject = [
  workspaceAccess.fromProject("projectId"),
  requireWorkspacePermission({ project: ["read"] }),
];
const readNote = [
  workspaceAccess.fromProjectNote("id"),
  requireWorkspacePermission({ project: ["read"] }),
];
const editNote = [
  workspaceAccess.fromProjectNote("id"),
  requireWorkspacePermission({ task: ["update"] }),
];

const listRoute = createRoute({
  method: "get",
  operationId: "listProjectNotes",
  path: "/project/{projectId}",
  tags: ["Project notes"],
  summary: "List project notes",
  description:
    "List a project's notes without their content, most recently updated first.",
  middleware: readProject,
  request: { params: projectNoteProjectParam },
  responses: {
    200: jsonResponse("Project notes", z.array(projectNoteSummarySchema)),
    403: errorResponse("No access to the project, or missing read permission"),
    404: errorResponse("Project not found"),
  },
});

const createNoteRoute = createRoute({
  method: "post",
  operationId: "createProjectNote",
  path: "/project/{projectId}",
  tags: ["Project notes"],
  summary: "Create a project note",
  description:
    "Create a note, optionally with a starting document. Requires task:update permission. Documents larger than 5 MB are refused.",
  middleware: [
    workspaceAccess.fromProject("projectId"),
    requireWorkspacePermission({ task: ["update"] }),
  ] as const,
  request: {
    params: projectNoteProjectParam,
    body: {
      required: true,
      content: { "application/json": { schema: createProjectNoteBody } },
    },
  },
  responses: {
    201: jsonResponse("The created note", projectNoteSchema),
    400: errorResponse("Invalid body"),
    403: errorResponse(
      "No access to the project, or missing task:update permission",
    ),
    404: errorResponse("Project not found"),
    413: errorResponse("The note is larger than 5 MB"),
  },
});

const getNoteRoute = createRoute({
  method: "get",
  operationId: "getProjectNote",
  path: "/{id}",
  tags: ["Project notes"],
  summary: "Get a project note",
  middleware: readNote,
  request: { params: projectNoteParam },
  responses: {
    200: jsonResponse("The note with its content", projectNoteSchema),
    403: errorResponse("No access to the project, or missing read permission"),
    404: errorResponse("Note not found"),
  },
});

const saveNoteRoute = createRoute({
  method: "put",
  operationId: "saveProjectNote",
  path: "/{id}",
  tags: ["Project notes"],
  summary: "Save a project note",
  description:
    "Replace a note's title and content. The last save wins: a save based on an older version still succeeds and reports whose changes it replaced. Requires task:update permission. Documents larger than 5 MB are refused.",
  middleware: editNote,
  request: {
    params: projectNoteParam,
    body: {
      required: true,
      content: { "application/json": { schema: saveProjectNoteBody } },
    },
  },
  responses: {
    200: jsonResponse("The saved note version", savedProjectNoteSchema),
    400: errorResponse("Invalid body"),
    403: errorResponse(
      "No access to the project, or missing task:update permission",
    ),
    404: errorResponse("Note not found"),
    413: errorResponse("The note is larger than 5 MB"),
  },
});

const deleteNoteRoute = createRoute({
  method: "delete",
  operationId: "deleteProjectNote",
  path: "/{id}",
  tags: ["Project notes"],
  summary: "Delete a project note",
  description:
    "Delete a note. Its author can delete it with task:update permission; anyone else also needs task:delete.",
  middleware: editNote,
  request: { params: projectNoteParam },
  responses: {
    200: jsonResponse("Note deleted", z.object({ success: z.boolean() })),
    403: errorResponse(
      "No access to the project, missing task:update permission, or not the author without task:delete",
    ),
    404: errorResponse("Note not found"),
  },
});

const projectNote = apiRouter()
  .openapi(listRoute, async (c) => {
    c.header("Cache-Control", "private, no-store");
    return c.json(await listProjectNotes(c.req.valid("param").projectId), 200);
  })
  .openapi(createNoteRoute, async (c) => {
    const { title, content } = c.req.valid("json");
    return c.json(
      await createProjectNote({
        projectId: c.req.valid("param").projectId,
        userId: c.get("userId"),
        title,
        content,
      }),
      201,
    );
  })
  .openapi(getNoteRoute, async (c) => {
    c.header("Cache-Control", "private, no-store");
    const note = await selectNote(c.req.valid("param").id);
    if (!note) throw new HTTPException(404, { message: "Note not found" });
    return c.json(note, 200);
  })
  .openapi(saveNoteRoute, async (c) => {
    const { baseVersion, title, content } = c.req.valid("json");
    return c.json(
      await saveProjectNote({
        id: c.req.valid("param").id,
        userId: c.get("userId"),
        baseVersion,
        title,
        content,
      }),
      200,
    );
  })
  .openapi(deleteNoteRoute, async (c) => {
    return c.json(
      await deleteProjectNote({
        id: c.req.valid("param").id,
        userId: c.get("userId"),
        canDeleteOthers: await hasWorkspacePermission(c, { task: ["delete"] }),
      }),
      200,
    );
  });

export default projectNote;
