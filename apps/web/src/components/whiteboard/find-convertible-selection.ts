import {
  type BoardElement,
  TASK_ID_FIELD,
  TASK_KEY_FIELD,
} from "./board-element";

export type ConvertibleSelection = {
  // The element that carries the task link: a sticky note's shape, or the
  // text itself when it stands alone.
  targetId: string;
  text: string;
  taskId: string | null;
  taskKey: string | null;
};

function stringField(element: BoardElement, field: string) {
  const value = element.customData?.[field];
  return typeof value === "string" ? value : null;
}

// A selection qualifies when it holds exactly one piece of text: a text
// element, a shape with text inside (a sticky note), or a group around one.
export function findConvertibleSelection(
  elements: readonly BoardElement[],
  selectedIds: Readonly<Record<string, boolean>>,
): ConvertibleSelection | null {
  const byId = new Map(
    elements
      .filter((element) => !element.isDeleted)
      .map((element) => [element.id, element]),
  );
  const texts = new Set<BoardElement>();

  for (const [id, selected] of Object.entries(selectedIds)) {
    if (!selected) continue;
    const element = byId.get(id);
    if (!element) continue;
    if (element.type === "text") {
      texts.add(element);
      continue;
    }
    for (const bound of element.boundElements ?? []) {
      const text = bound.type === "text" ? byId.get(bound.id) : undefined;
      if (text) texts.add(text);
    }
  }

  if (texts.size !== 1) return null;
  const [text] = texts;
  if (!text) return null;
  const value = (text.originalText ?? text.text ?? "").trim();
  if (!value) return null;

  const target = (text.containerId && byId.get(text.containerId)) || text;
  return {
    targetId: target.id,
    text: value,
    taskId: stringField(target, TASK_ID_FIELD),
    taskKey: stringField(target, TASK_KEY_FIELD),
  };
}
