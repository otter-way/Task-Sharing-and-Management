import { expect, it } from "vite-plus/test";
import { taskFromText } from "./task-from-text";

it("uses the first line as the title and the rest as the description", () => {
  expect(taskFromText("Veli toplantısı\n\n Salı 15:00 \nB salonu")).toEqual({
    title: "Veli toplantısı",
    description: "Salı 15:00\n\nB salonu",
  });
  expect(taskFromText("Pano çalışması")).toEqual({
    title: "Pano çalışması",
    description: "",
  });
});

it("shortens a very long first line and keeps the full text", () => {
  const long = "a".repeat(250);
  const task = taskFromText(long);
  expect(task.title).toHaveLength(200);
  expect(task.title.endsWith("…")).toBe(true);
  expect(task.description).toBe(long);
});
