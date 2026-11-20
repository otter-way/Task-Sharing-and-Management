import { describe, expect, it } from "vite-plus/test";
import { rescheduleDates } from "./reschedule";

const iso = (...args: [number, number, number, number?, number?]) =>
  new Date(...(args as [number, number, number, number, number])).toISOString();

describe("rescheduleDates", () => {
  it("gives an undated task the day as its due date", () => {
    expect(
      rescheduleDates(
        { startDate: null, dueDate: null },
        new Date(2026, 10, 18, 14),
      ),
    ).toEqual({ startDate: null, dueDate: iso(2026, 10, 18, 0, 0) });
  });

  it("keeps the due time and shifts the start by the same days", () => {
    expect(
      rescheduleDates(
        {
          startDate: iso(2026, 10, 16, 9, 0),
          dueDate: iso(2026, 10, 18, 17, 30),
        },
        new Date(2026, 10, 20),
      ),
    ).toEqual({
      startDate: iso(2026, 10, 18, 9, 0),
      dueDate: iso(2026, 10, 20, 17, 30),
    });
  });

  it("moves a start-only task by its start date", () => {
    expect(
      rescheduleDates(
        { startDate: iso(2026, 10, 16, 10, 0), dueDate: null },
        new Date(2026, 10, 19),
      ),
    ).toEqual({ startDate: iso(2026, 10, 19, 10, 0), dueDate: null });
  });

  it("clears both dates when dropped on the undated list", () => {
    expect(
      rescheduleDates(
        { startDate: iso(2026, 10, 16), dueDate: iso(2026, 10, 18) },
        null,
      ),
    ).toEqual({ startDate: null, dueDate: null });
  });
});
