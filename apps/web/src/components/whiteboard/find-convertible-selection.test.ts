import { describe, expect, it } from "vite-plus/test";
import type { BoardElement } from "./board-element";
import { findConvertibleSelection } from "./find-convertible-selection";

const note: BoardElement = {
  id: "note",
  type: "rectangle",
  version: 1,
  isDeleted: false,
  boundElements: [{ id: "note-text", type: "text" }],
};
const noteText: BoardElement = {
  id: "note-text",
  type: "text",
  version: 1,
  isDeleted: false,
  containerId: "note",
  text: "Veli\nbülteni",
  originalText: "Veli bülteni",
};
const loose: BoardElement = {
  id: "loose",
  type: "text",
  version: 1,
  isDeleted: false,
  text: "  Pano çalışması  ",
};
const elements = [note, noteText, loose];

describe("findConvertibleSelection", () => {
  it("reads a standalone text element", () => {
    expect(findConvertibleSelection(elements, { loose: true })).toEqual({
      targetId: "loose",
      text: "Pano çalışması",
      taskId: null,
      taskKey: null,
    });
  });

  it("targets the shape of a sticky note and reads its unwrapped text", () => {
    const selections: Record<string, boolean>[] = [
      { note: true },
      { "note-text": true },
      { note: true, "note-text": true },
    ];
    for (const selection of selections) {
      expect(findConvertibleSelection(elements, selection)).toMatchObject({
        targetId: "note",
        text: "Veli bülteni",
      });
    }
  });

  it("ignores selections with no text or more than one text", () => {
    expect(findConvertibleSelection(elements, {})).toBeNull();
    expect(
      findConvertibleSelection(elements, { note: true, loose: true }),
    ).toBeNull();
    expect(
      findConvertibleSelection(
        [{ id: "box", type: "rectangle", version: 1, isDeleted: false }],
        { box: true },
      ),
    ).toBeNull();
  });

  it("ignores deleted and blank text", () => {
    expect(
      findConvertibleSelection([{ ...loose, isDeleted: true }], {
        loose: true,
      }),
    ).toBeNull();
    expect(
      findConvertibleSelection([{ ...loose, text: "   " }], { loose: true }),
    ).toBeNull();
  });

  it("reports a task the element was already converted into", () => {
    const converted = {
      ...note,
      customData: { kaneoTaskId: "task-1", kaneoTaskKey: "IP-12" },
    };
    expect(
      findConvertibleSelection([converted, noteText], { note: true }),
    ).toMatchObject({ targetId: "note", taskId: "task-1", taskKey: "IP-12" });
  });
});
