import { expect, type Page, test } from "@playwright/test";
import { createProject, createTask, createWorkspace } from "./helpers";

// The flows a small team relies on every week: add a task, put it on a day in
// the calendar, and turn an idea on the whiteboard into a task.

function projectIdFrom(boardUrl: string) {
  const match = /\/project\/([^/]+)\/board$/.exec(new URL(boardUrl).pathname);
  if (!match?.[1]) throw new Error(`No project id in ${boardUrl}`);
  return match[1];
}

async function dragTo(
  page: Page,
  from: { x: number; y: number },
  to: { x: number; y: number },
) {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  // dnd-kit starts a drag after 6px; move in steps so it sees the path.
  const steps = 15;
  for (let step = 1; step <= steps; step++) {
    await page.mouse.move(
      from.x + ((to.x - from.x) * step) / steps,
      from.y + ((to.y - from.y) * step) / steps,
    );
  }
  await page.mouse.up();
}

test("a new task can be dragged onto a day in the calendar", async ({
  page,
}) => {
  await createWorkspace(page);
  const boardUrl = await createProject(page);
  await createTask(page, "Parent meeting notes");

  await page.goto(boardUrl.replace(/\/board$/, "/calendar"));
  const undated = page.getByRole("complementary", { name: "Undated" });
  const row = undated.getByRole("button", { name: /Parent meeting notes/ });
  await expect(row).toBeVisible();

  // Wednesday of the week on screen.
  const day = page.locator("section[data-day]").nth(2);
  const dayKey = await day.getAttribute("data-day");
  if (!dayKey) throw new Error("Week has no days");

  const rowBox = await row.boundingBox();
  const dayBox = await day.boundingBox();
  if (!rowBox || !dayBox) throw new Error("Row or day is not on screen");

  const [saved] = await Promise.all([
    page.waitForResponse(
      (response) =>
        /\/api\/task\//.test(response.url()) &&
        response.request().method() === "PUT",
    ),
    dragTo(
      page,
      { x: rowBox.x + 20, y: rowBox.y + rowBox.height / 2 },
      { x: dayBox.x + dayBox.width / 2, y: dayBox.y + 80 },
    ),
  ]);
  expect(saved.ok()).toBe(true);

  const scheduled = page
    .locator(`section[data-day="${dayKey}"]`)
    .getByRole("button", { name: /Parent meeting notes/ });
  await expect(scheduled).toBeVisible();
  await expect(row).toHaveCount(0);

  // The new date came from the server, not only the optimistic cache.
  await page.reload();
  await expect(scheduled).toBeVisible();
  await expect(
    undated.getByRole("button", { name: /Parent meeting notes/ }),
  ).toHaveCount(0);
});

test("text on the whiteboard becomes a linked task", async ({ page }) => {
  await createWorkspace(page);
  const boardUrl = await createProject(page);
  const projectId = projectIdFrom(boardUrl);

  await page.goto(boardUrl.replace(/\/board$/, "/whiteboard"));
  const canvas = page.locator("canvas.excalidraw__canvas.interactive");
  await expect(canvas).toBeVisible();

  // Write a note with the text tool, then finish editing; the text stays
  // selected, which is what the convert button follows.
  const box = await canvas.boundingBox();
  if (!box) throw new Error("Canvas is not on screen");
  // The tool is a hidden radio input; people click its label.
  await page.getByTestId("toolbar-text").locator("xpath=..").click();
  // The canvas sits under Excalidraw's UI layer, so click by position.
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await page.keyboard.type("Plan the career day");
  await page.keyboard.press("Escape");

  const convert = page.getByRole("button", { name: "Convert to task" });
  await expect(convert).toBeVisible();
  const [created] = await Promise.all([
    page.waitForResponse(
      (response) =>
        response.url().includes(`/api/task/${projectId}`) &&
        response.request().method() === "POST",
    ),
    convert.click(),
  ]);
  expect(created.ok()).toBe(true);
  const task = (await created.json()) as { id: string; title: string };
  expect(task.title).toBe("Plan the career day");

  // The note now links to its task instead of offering to convert again.
  await expect(
    page.getByRole("button", { name: /^Open [A-Z]+-\d+$/ }),
  ).toBeVisible();
  await expect(convert).toHaveCount(0);

  // The link is saved with the board, so teammates and reloads see it.
  await expect
    .poll(
      async () => {
        const response = await page.request.get(
          `/api/project-board/${projectId}`,
        );
        if (!response.ok()) return null;
        const board = (await response.json()) as {
          scene?: { elements?: { customData?: { kaneoTaskId?: string } }[] };
        };
        return (
          board.scene?.elements?.some(
            (element) => element.customData?.kaneoTaskId === task.id,
          ) ?? false
        );
      },
      { timeout: 15_000 },
    )
    .toBe(true);

  await page.goto(boardUrl);
  await expect(
    page.getByText("Plan the career day", { exact: true }),
  ).toBeVisible();
});
