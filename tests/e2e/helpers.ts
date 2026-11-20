import { randomUUID } from "node:crypto";
import {
  type APIRequestContext,
  expect,
  type Page,
  test,
} from "@playwright/test";

// Shared by the browser specs: fixtures go through the real API with the same
// origin checks as the UI; projects and tasks are created through the UI.

export async function post(
  request: APIRequestContext,
  path: string,
  data: object,
) {
  const baseURL = test.info().project.use.baseURL;
  if (!baseURL) throw new Error("Browser tests require a baseURL");
  const response = await request.post(`/api/${path}`, {
    data,
    // Authenticated fixture requests must satisfy the same origin checks as the UI.
    headers: { Origin: new URL(baseURL).origin },
  });
  await expect(response).toBeOK();
  return response.json();
}

export async function signUp(request: APIRequestContext) {
  const suffix = randomUUID();
  const email = `task-${suffix}@example.com`;
  await post(request, "auth/sign-up/email", {
    name: "Task Tester",
    email,
    password: `Browser-test-${suffix}`,
  });
  // The app opens in Turkish unless the person picked a language; the
  // browser's language is not used. The specs read English labels.
  await post(request, "auth/update-user", { locale: "en-US" });
  return email;
}

export async function createWorkspace(page: Page) {
  await signUp(page.request);
  const workspace = await post(page.request, "auth/organization/create", {
    name: "Task test workspace",
    slug: `browser-${randomUUID()}`,
  });
  await post(page.request, "auth/organization/set-active", {
    organizationId: workspace.id,
  });
  await page.goto(`/dashboard/workspace/${workspace.id}`);
  return workspace.id as string;
}

export async function createProject(page: Page) {
  await page.getByRole("link", { name: "All projects", exact: true }).click();
  await expect(page).toHaveURL(/\/projects$/);
  await page
    .getByRole("button", { name: "Create project", exact: true })
    .first()
    .click();
  await page
    .getByPlaceholder("Project name", { exact: true })
    .fill("Browser project");
  await page
    .getByRole("button", { name: "Create Project", exact: true })
    .click();
  await expect(page).toHaveURL(/\/project\/[^/]+\/board$/);
  await expect(
    page.getByTitle("Add task", { exact: true }).first(),
  ).toBeVisible();
  return page.url();
}

export async function createTask(page: Page, title: string) {
  await page.getByTitle("Add task", { exact: true }).first().click();
  await page.getByPlaceholder("Task title", { exact: true }).fill(title);
  await page.getByRole("button", { name: "Create Task", exact: true }).click();
  // The modal's title field also matches the text until the dialog closes.
  await expect(
    page.getByPlaceholder("Task title", { exact: true }),
  ).toBeHidden();
  await expect(page.getByText(title, { exact: true })).toBeVisible();
}
