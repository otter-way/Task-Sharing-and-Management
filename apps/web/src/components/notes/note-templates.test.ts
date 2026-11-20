import { expect, it } from "vite-plus/test";
import { buildNoteTemplate } from "./note-templates";

const t = (key: string) => key.split(".").at(-1) ?? key;

it("builds the weekly meeting with agenda, decisions and a to-do list", () => {
  const note = buildNoteTemplate("weeklyMeeting", t, "20 Kasım 2026");
  expect(note.title).toBe("name · 20 Kasım 2026");
  expect(note.content.map((block) => block.content ?? block.type)).toEqual([
    "agenda",
    "bulletListItem",
    "decisions",
    "bulletListItem",
    "actionItems",
    "checkListItem",
  ]);
});

it("ends the brainstorm summary with next steps as to-dos", () => {
  const note = buildNoteTemplate("brainstorm", t, "20 Kasım 2026");
  expect(note.content.at(-2)?.content).toBe("nextSteps");
  expect(note.content.at(-1)?.type).toBe("checkListItem");
});

it("starts a blank note empty", () => {
  expect(buildNoteTemplate("blank", t, "")).toEqual({ title: "", content: [] });
});
