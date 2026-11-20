import { DndContext } from "@dnd-kit/core";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vite-plus/test";
import { WeekGrid } from "./week-grid";
import { buildWeekDays } from "./week-model";

vi.mock("react-i18next", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-i18next")>()),
  useTranslation: () => ({
    t: (key: string, options?: { count?: number }) =>
      options?.count === undefined ? key : `${key}:${options.count}`,
  }),
}));

afterEach(cleanup);

const days = buildWeekDays(new Date(2026, 10, 18), 1);
const row = (id: string, status = "to-do") => ({
  id,
  title: `Görev ${id}`,
  number: Number(id),
  status,
});

function renderGrid(
  groups: ReturnType<typeof row>[][],
  emptyMessage: { title: string } | null = null,
) {
  const onMoveByDays = vi.fn();
  render(
    <DndContext>
      <WeekGrid
        days={days}
        groups={groups}
        direction={0}
        emptyMessage={emptyMessage}
        projectSlug="KP"
        finalStatuses={new Set(["done"])}
        canMove
        animateLayout={false}
        onOpenTask={vi.fn()}
        onMoveByDays={onMoveByDays}
      />
    </DndContext>,
  );
  return { onMoveByDays };
}

it("lists each day's tasks with a count and marks finished ones", () => {
  renderGrid([[], [], [row("1"), row("2", "done")], [], [], [], []]);
  const days = screen.getAllByRole("region");
  expect(days).toHaveLength(7);
  const wednesday = days[2] as HTMLElement;
  expect(within(wednesday).getByText("2")).toBeTruthy();
  // Day columns are narrow, so the key lives in the tooltip.
  expect(within(wednesday).queryByText("KP-1")).toBeNull();
  expect(
    within(wednesday).getByText("Görev 1").closest("button")?.title,
  ).toContain("KP-1 · Görev 1");
  expect(within(wednesday).getByText("Görev 2").className).toContain(
    "line-through",
  );
});

it("shows the empty-week message when nothing is planned", () => {
  renderGrid(
    days.map(() => []),
    { title: "Bu hafta planlanmış görev yok" },
  );
  expect(screen.getByText("Bu hafta planlanmış görev yok")).toBeTruthy();
});

it("moves a task by a day with Alt and the arrow keys", () => {
  const { onMoveByDays } = renderGrid([[row("1")], [], [], [], [], [], []]);
  const button = screen.getByText("Görev 1").closest("button") as HTMLElement;
  fireEvent.keyDown(button, { key: "ArrowRight", altKey: true });
  fireEvent.keyDown(button, { key: "ArrowLeft", altKey: true });
  fireEvent.keyDown(button, { key: "ArrowLeft" });
  expect(onMoveByDays.mock.calls).toEqual([
    ["1", 1],
    ["1", -1],
  ]);
});
