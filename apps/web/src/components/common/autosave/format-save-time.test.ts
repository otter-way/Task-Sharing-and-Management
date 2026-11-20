import { expect, it } from "vite-plus/test";
import { formatSaveTime } from "./format-save-time";

const now = new Date(2026, 10, 20, 16, 0);

it("shows only the time for a save made today", () => {
  expect(formatSaveTime(new Date(2026, 10, 20, 14, 5), now, "tr-TR")).toBe(
    "14:05",
  );
});

it("adds the date for an older save", () => {
  expect(formatSaveTime(new Date(2026, 10, 18, 9, 30), now, "tr-TR")).toBe(
    "18 Kas 09:30",
  );
});
