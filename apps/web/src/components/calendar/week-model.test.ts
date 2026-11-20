import { describe, expect, it } from "vite-plus/test";
import {
  buildWeekDays,
  dayKey,
  formatWeekRange,
  groupTasksByDay,
} from "./week-model";

const task = (title: string, due: Date) => ({ title, scheduleEnd: due });

describe("week model", () => {
  it("builds Monday to Sunday around any day of the week", () => {
    const days = buildWeekDays(new Date(2026, 10, 20), 1);
    expect(days.map(dayKey)).toEqual([
      "2026-11-16",
      "2026-11-17",
      "2026-11-18",
      "2026-11-19",
      "2026-11-20",
      "2026-11-21",
      "2026-11-22",
    ]);
  });

  it("puts tasks on their due day and leaves out other weeks", () => {
    const days = buildWeekDays(new Date(2026, 10, 20), 1);
    const groups = groupTasksByDay(
      [
        task("Pano", new Date(2026, 10, 18, 15)),
        task("Bülten", new Date(2026, 10, 18, 9)),
        task("Gelecek hafta", new Date(2026, 10, 23)),
        task("Pazar", new Date(2026, 10, 22, 23, 30)),
      ],
      days,
    );
    expect(groups.map((group) => group.map((item) => item.title))).toEqual([
      [],
      [],
      ["Bülten", "Pano"],
      [],
      [],
      [],
      ["Pazar"],
    ]);
  });

  it("formats the week as one range", () => {
    expect(
      formatWeekRange(buildWeekDays(new Date(2026, 10, 20), 1), "tr-TR"),
    ).toBe("16–22 Kasım 2026");
    expect(
      formatWeekRange(buildWeekDays(new Date(2026, 11, 2), 1), "tr-TR"),
    ).toBe("30 Kasım\u2009–\u20096 Aralık 2026");
  });
});
