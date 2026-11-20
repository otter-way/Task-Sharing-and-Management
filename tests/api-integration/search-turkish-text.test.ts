import { beforeEach, describe, expect, it } from "vite-plus/test";
import db, { schema } from "../../apps/api/src/database";
import { createApp } from "../../apps/api/src/index";
import { mockAuthenticatedSession } from "./helpers/auth";
import { resetTestDatabase } from "./helpers/database";
import {
  createProjectFixture,
  createWorkspaceMember,
} from "./helpers/fixtures";

async function searchTaskTitles(workspaceId: string, q: string) {
  const { app } = createApp();
  const response = await app.request(
    `/api/search?${new URLSearchParams({ q, type: "tasks", workspaceId })}`,
  );
  expect(response.status).toBe(200);
  const body = (await response.json()) as { results: { title: string }[] };
  return body.results.map((result) => result.title).sort();
}

describe("global search with Turkish text", () => {
  beforeEach(async () => {
    await resetTestDatabase();
  });

  it("matches regardless of case and Turkish letter marks", async () => {
    const member = await createWorkspaceMember();
    const { project, columns } = await createProjectFixture({
      workspaceId: member.workspace.id,
    });
    const titles = ["IŞIK raporu", "İstanbul toplantısı", "Görev listesi"];
    await db.insert(schema.taskTable).values(
      titles.map((title, index) => ({
        projectId: project.id,
        columnId: columns.todo.id,
        number: index + 1,
        title,
      })),
    );

    mockAuthenticatedSession(member.user);
    const workspaceId = member.workspace.id;

    expect(await searchTaskTitles(workspaceId, "ışık")).toEqual([
      "IŞIK raporu",
    ]);
    expect(await searchTaskTitles(workspaceId, "isik")).toEqual([
      "IŞIK raporu",
    ]);
    expect(await searchTaskTitles(workspaceId, "istanbul")).toEqual([
      "İstanbul toplantısı",
    ]);
    expect(await searchTaskTitles(workspaceId, "İSTANBUL")).toEqual([
      "İstanbul toplantısı",
    ]);
    expect(await searchTaskTitles(workspaceId, "gorev")).toEqual([
      "Görev listesi",
    ]);
  });

  it("matches a percent sign literally", async () => {
    const member = await createWorkspaceMember();
    const { project, columns } = await createProjectFixture({
      workspaceId: member.workspace.id,
    });
    await db.insert(schema.taskTable).values([
      {
        projectId: project.id,
        columnId: columns.todo.id,
        number: 1,
        title: "Yüzde 50% indirim",
      },
      {
        projectId: project.id,
        columnId: columns.todo.id,
        number: 2,
        title: "Yüzde 50 hedef",
      },
    ]);

    mockAuthenticatedSession(member.user);
    expect(await searchTaskTitles(member.workspace.id, "50%")).toEqual([
      "Yüzde 50% indirim",
    ]);
  });
});
