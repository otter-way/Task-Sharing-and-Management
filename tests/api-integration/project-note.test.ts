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
  await db
    .insert(schema.workspaceUserTable)
    .values({ workspaceId, userId, role, joinedAt: new Date() });
  if (!user) throw new Error("user not created");
  return user;
}

const doc = (text: string) => [
  {
    id: "b1",
    type: "paragraph",
    props: {},
    content: [{ type: "text", text, styles: {} }],
    children: [],
  },
];

function api(path: string, init?: { method: string; body?: unknown }) {
  const { app } = createApp();
  return app.request(`/api/project-note${path}`, {
    method: init?.method ?? "GET",
    ...(init?.body === undefined
      ? {}
      : {
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(init.body),
        }),
  });
}

async function setup() {
  const owner = await createWorkspaceMember({ userName: "Ayşe" });
  const { project } = await createProjectFixture({
    workspaceId: owner.workspace.id,
  });
  return { owner, project };
}

describe("API integration: project notes", () => {
  beforeEach(async () => {
    await resetTestDatabase();
    publish.mockClear();
  });

  it("creates, lists without content, and opens a note", async () => {
    const { owner, project } = await setup();
    mockAuthenticatedSession(owner.user);

    const created = await api(`/project/${project.id}`, {
      method: "POST",
      body: { title: "Haftalık Toplantı", content: doc("Gündem") },
    });
    expect(created.status).toBe(201);
    const note = await created.json();
    expect(note).toMatchObject({
      title: "Haftalık Toplantı",
      version: 1,
      createdBy: { id: owner.user.id, name: "Ayşe" },
      updatedBy: { id: owner.user.id, name: "Ayşe" },
      content: doc("Gündem"),
    });

    const list = await (await api(`/project/${project.id}`)).json();
    expect(list).toHaveLength(1);
    expect(list[0]).not.toHaveProperty("content");

    const opened = await (await api(`/${note.id}`)).json();
    expect(opened.content).toEqual(doc("Gündem"));
    expect(publish).toHaveBeenCalledWith("project_note.updated", {
      projectId: project.id,
    });
  });

  it("lets the last save win and reports whose work it replaced", async () => {
    const { owner, project } = await setup();
    const mehmet = await addMember(owner.workspace.id, "member", "Mehmet");
    mockAuthenticatedSession(owner.user);
    const note = await (
      await api(`/project/${project.id}`, { method: "POST", body: {} })
    ).json();

    const first = await api(`/${note.id}`, {
      method: "PUT",
      body: { baseVersion: 1, title: "Ayşe", content: doc("Ayşe") },
    });
    expect(await first.json()).toMatchObject({ version: 2, overwritten: null });

    mockAuthenticatedSession(mehmet);
    const second = await api(`/${note.id}`, {
      method: "PUT",
      body: { baseVersion: 1, title: "Mehmet", content: doc("Mehmet") },
    });
    expect(await second.json()).toMatchObject({
      version: 3,
      overwritten: { updatedBy: { id: owner.user.id, name: "Ayşe" } },
    });
    expect(await (await api(`/${note.id}`)).json()).toMatchObject({
      title: "Mehmet",
      content: doc("Mehmet"),
      createdBy: { name: "Ayşe" },
      updatedBy: { name: "Mehmet" },
    });
  });

  it("lets viewers read but not write", async () => {
    const { owner, project } = await setup();
    mockAuthenticatedSession(owner.user);
    const note = await (
      await api(`/project/${project.id}`, { method: "POST", body: {} })
    ).json();
    const viewer = await addMember(owner.workspace.id, "viewer", "Viewer");

    mockAuthenticatedSession(viewer);
    expect((await api(`/project/${project.id}`)).status).toBe(200);
    expect((await api(`/${note.id}`)).status).toBe(200);
    expect(
      (await api(`/project/${project.id}`, { method: "POST", body: {} }))
        .status,
    ).toBe(403);
    expect(
      (
        await api(`/${note.id}`, {
          method: "PUT",
          body: { baseVersion: 1, title: "x", content: [] },
        })
      ).status,
    ).toBe(403);
  });

  it("hides notes from people outside the workspace", async () => {
    const { owner, project } = await setup();
    mockAuthenticatedSession(owner.user);
    const note = await (
      await api(`/project/${project.id}`, { method: "POST", body: {} })
    ).json();
    const outsider = await createWorkspaceMember();

    mockAuthenticatedSession(outsider.user);
    expect([403, 404]).toContain((await api(`/project/${project.id}`)).status);
    expect([403, 404]).toContain((await api(`/${note.id}`)).status);
  });

  it("lets authors delete their notes and admins delete anyone's", async () => {
    const { owner, project } = await setup();
    const member = await addMember(owner.workspace.id, "member", "Üye");
    mockAuthenticatedSession(owner.user);
    const ownersNote = await (
      await api(`/project/${project.id}`, { method: "POST", body: {} })
    ).json();

    mockAuthenticatedSession(member);
    expect((await api(`/${ownersNote.id}`, { method: "DELETE" })).status).toBe(
      403,
    );
    const membersNote = await (
      await api(`/project/${project.id}`, { method: "POST", body: {} })
    ).json();
    expect((await api(`/${membersNote.id}`, { method: "DELETE" })).status).toBe(
      200,
    );

    mockAuthenticatedSession(owner.user);
    expect((await api(`/${ownersNote.id}`, { method: "DELETE" })).status).toBe(
      200,
    );
    expect(await (await api(`/project/${project.id}`)).json()).toEqual([]);
  });

  it("refuses notes larger than 5 MB", async () => {
    const { owner, project } = await setup();
    mockAuthenticatedSession(owner.user);
    const response = await api(`/project/${project.id}`, {
      method: "POST",
      body: { title: "Büyük", content: doc("a".repeat(6e6)) },
    });
    expect(response.status).toBe(413);
  });
});
