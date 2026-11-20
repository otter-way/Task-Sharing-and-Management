import { describe, expect, it } from "vite-plus/test";
import { filterNoteSlashItems, noteSlashItems } from "./note-slash-items";

const all = [
  { key: "paragraph", title: "Paragraf" },
  { key: "image", title: "Görsel" },
  { key: "heading", title: "Başlık 1", aliases: ["h1"] },
  { key: "check_list", title: "Yapılacak Listesi", aliases: ["todo"] },
  { key: "code_block", title: "Kod Bloğu" },
  { key: "quote", title: "Alıntı" },
];

describe("notes slash menu", () => {
  it("keeps only the note blocks, in menu order", () => {
    expect(noteSlashItems(all).map((item) => item.key)).toEqual([
      "heading",
      "check_list",
      "quote",
      "image",
    ]);
  });

  it("matches Turkish titles without their letter marks", () => {
    const items = noteSlashItems(all);
    expect(filterNoteSlashItems(items, "basl").map((i) => i.key)).toEqual([
      "heading",
    ]);
    expect(filterNoteSlashItems(items, "YAPILACAK").map((i) => i.key)).toEqual([
      "check_list",
    ]);
    expect(filterNoteSlashItems(items, "alinti").map((i) => i.key)).toEqual([
      "quote",
    ]);
    expect(filterNoteSlashItems(items, "todo").map((i) => i.key)).toEqual([
      "check_list",
    ]);
    expect(filterNoteSlashItems(items, "")).toHaveLength(4);
  });
});
