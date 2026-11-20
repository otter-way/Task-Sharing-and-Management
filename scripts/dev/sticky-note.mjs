import { randomInt, randomUUID } from "node:crypto";

// A yellow sticky note as Excalidraw stores it: a rectangle with its text
// bound inside, so the whiteboard can convert it to a task. Notes sit in a
// two-column grid.
const WIDTH = 240;
const HEIGHT = 140;
const GAP = 40;

function base(type, x, y, width, height) {
  return {
    id: randomUUID(),
    type,
    x,
    y,
    width,
    height,
    angle: 0,
    strokeColor: "#1e1e1e",
    backgroundColor: "transparent",
    fillStyle: "solid",
    strokeWidth: 1,
    strokeStyle: "solid",
    roughness: 1,
    opacity: 100,
    groupIds: [],
    frameId: null,
    roundness: null,
    seed: randomInt(1, 2 ** 31),
    version: 1,
    versionNonce: randomInt(1, 2 ** 31),
    isDeleted: false,
    boundElements: null,
    updated: Date.now(),
    link: null,
    locked: false,
  };
}

const FONT_SIZE = 20;
const LINE_HEIGHT = 1.25;
// Excalidraw wraps bound text while someone types, not when a scene is
// loaded, so the lines are broken here to fit the note.
const CHARS_PER_LINE = 16;

function wrap(text) {
  const lines = [];
  for (const word of text.split(" ")) {
    const last = lines.at(-1);
    if (last !== undefined && `${last} ${word}`.length <= CHARS_PER_LINE) {
      lines[lines.length - 1] = `${last} ${word}`;
    } else {
      lines.push(word);
    }
  }
  return lines.join("\n");
}

export function stickyNote(text, index) {
  const x = 120 + (index % 2) * (WIDTH + GAP);
  const y = 120 + Math.floor(index / 2) * (HEIGHT + GAP);
  const shape = {
    ...base("rectangle", x, y, WIDTH, HEIGHT),
    backgroundColor: "#ffec99",
    roundness: { type: 3 },
  };
  const wrapped = wrap(text);
  const textHeight = wrapped.split("\n").length * FONT_SIZE * LINE_HEIGHT;
  const label = {
    ...base(
      "text",
      x + 10,
      y + (HEIGHT - textHeight) / 2,
      WIDTH - 20,
      textHeight,
    ),
    text: wrapped,
    originalText: text,
    fontSize: FONT_SIZE,
    fontFamily: 5,
    textAlign: "center",
    verticalAlign: "middle",
    containerId: shape.id,
    autoResize: true,
    lineHeight: LINE_HEIGHT,
  };
  shape.boundElements = [{ id: label.id, type: "text" }];
  return [shape, label];
}
