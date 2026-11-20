import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import db, { schema } from "../../apps/api/src/database";
import { createApp } from "../../apps/api/src/index";
import { mockAuthenticatedSession } from "./helpers/auth";
import { resetTestDatabase } from "./helpers/database";
import {
  createProjectFixture,
  createWorkspaceMember,
} from "./helpers/fixtures";

const publish = vi.hoisted(() => vi.fn(async () => {}));
vi.mock("../../apps/api/src/events", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../apps/api/src/events")>()),
  publishEvent: publish,
}));

async function addMember(workspaceId: string, role: string, name: string) {
  const userId = `user-${randomUUID()}`;
  const [user] = await db
    .insert(schema.userTable)
    .values({
      id: userId,
      email: `${userId}@example.com`,
      emailVerified: true,
      name,
    })
    .returning();
  await db.insert(schema.workspaceUserTable).values({
    workspaceId,
    userId,
    role,
    joinedAt: new Date(),
  });
  if (!user) throw new Error("user not created");
  return user;
}

function scene(text: string) {
  return {
    elements: [{ id: "note-1", type: "text", text, isDeleted: false }],
    appState: { viewBackgroundColor: "#ffffff" },
  };
}

async function getBoard(projectId: string) {
  const { app } = createApp();
  return app.request(`/api/project-board/${projectId}`);
}

async function saveBoard(projectId: string, body: unknown) {
  const { app } = createApp();
  return app.request(`/api/project-board/${projectId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("API integration: project whiteboard", () => {
  beforeEach(async () => {
    await resetTestDatabase();
    publish.mockClear();
  });

  it("returns an empty board before the first save", async () => {
    const member = await createWorkspaceMember();
    const { project } = await createProjectFixture({
      workspaceId: member.workspace.id,
    });
    mockAuthenticatedSession(member.user);

    const response = await getBoard(project.id);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      projectId: project.id,
      scene: null,
      version: 0,
      updatedAt: null,
      updatedBy: null,
    });
  });

  it("saves, bumps the version, and announces the change", async () => {
    const member = await createWorkspaceMember({ userName: "Ayşe Yılmaz" });
    const { project } = await createProjectFixture({
      workspaceId: member.workspace.id,
    });
    mockAuthenticatedSession(member.user);

    const first = await saveBoard(project.id, {
      baseVersion: 0,
      scene: scene("İlk fikir"),
    });
    expect(first.status).toBe(200);
    expect(await first.json()).toMatchObject({ version: 1, overwritten: null });

    const second = await saveBoard(project.id, {
      baseVersion: 1,
      scene: scene("İkinci fikir"),
    });
    expect(await second.json()).toMatchObject({
      version: 2,
      overwritten: null,
    });

    const board = await (await getBoard(project.id)).json();
    expect(board).toMatchObject({
      version: 2,
      scene: scene("İkinci fikir"),
      updatedBy: { id: member.user.id, name: "Ayşe Yılmaz" },
    });
    expect(publish).toHaveBeenCalledWith("project_board.updated", {
      projectId: project.id,
    });
  });

  it("lets the last save win and reports whose work it replaced", async () => {
    const first = await createWorkspaceMember({ userName: "Ayşe" });
    const { project } = await createProjectFixture({
      workspaceId: first.workspace.id,
    });
    const second = await addMember(first.workspace.id, "member", "Mehmet");

    mockAuthenticatedSession(first.user);
    await saveBoard(project.id, { baseVersion: 0, scene: scene("Ayşe") });

    // Mehmet loaded version 1; Ayşe saves again before he does.
    await saveBoard(project.id, { baseVersion: 1, scene: scene("Ayşe 2") });

    mockAuthenticatedSession(second);
    const response = await saveBoard(project.id, {
      baseVersion: 1,
      scene: scene("Mehmet"),
    });
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      version: 3,
      overwritten: { updatedBy: { id: first.user.id, name: "Ayşe" } },
    });

    const board = await (await getBoard(project.id)).json();
    expect(board).toMatchObject({
      version: 3,
      scene: scene("Mehmet"),
      updatedBy: { id: second.id, name: "Mehmet" },
    });
  });

  it("lets viewers read but not save", async () => {
    const owner = await createWorkspaceMember();
    const { project } = await createProjectFixture({
      workspaceId: owner.workspace.id,
    });
    const viewer = await addMember(owner.workspace.id, "viewer", "Viewer");

    mockAuthenticatedSession(viewer);
    expect((await getBoard(project.id)).status).toBe(200);
    expect(
      (await saveBoard(project.id, { baseVersion: 0, scene: scene("x") }))
        .status,
    ).toBe(403);
  });

  it("hides boards from people outside the workspace", async () => {
    const owner = await createWorkspaceMember();
    const { project } = await createProjectFixture({
      workspaceId: owner.workspace.id,
    });
    const outsider = await createWorkspaceMember();

    mockAuthenticatedSession(outsider.user);
    expect([403, 404]).toContain((await getBoard(project.id)).status);
    expect([403, 404]).toContain(
      (await saveBoard(project.id, { baseVersion: 0, scene: scene("x") }))
        .status,
    );
  });

  it("refuses boards larger than 5 MB", async () => {
    const member = await createWorkspaceMember();
    const { project } = await createProjectFixture({
      workspaceId: member.workspace.id,
    });
    mockAuthenticatedSession(member.user);

    const response = await saveBoard(project.id, {
      baseVersion: 0,
      scene: { elements: [], files: { big: { dataURL: "a".repeat(6e6) } } },
    });
    expect(response.status).toBe(413);
  });
});
