// Inline content as BlockNote stores it: styled text, and links that hold
// their own text.
export type InlineNode = {
  type: string;
  text?: string;
  href?: string;
  styles?: Record<string, unknown>;
  content?: InlineNode[];
};

export type NoteBlock = {
  id: string;
  type: string;
  content?: unknown;
};

export type ChecklistTarget = {
  blockId: string;
  text: string;
  taskId: string | null;
  taskKey: string | null;
};

const TASK_LINK = /\/project\/[^/]+\/task\/([^/?#]+)/;

export function taskIdFromHref(href: string) {
  return TASK_LINK.exec(href)?.[1] ?? null;
}

function inlineNodes(content: unknown): InlineNode[] {
  return Array.isArray(content) ? (content as InlineNode[]) : [];
}

function plainText(nodes: InlineNode[]): string {
  return nodes
    .map((node) =>
      node.type === "link" ? plainText(node.content ?? []) : (node.text ?? ""),
    )
    .join("");
}

// A selection qualifies when it is a single to-do item with text. A to-do
// that already links to a task reports that task instead.
export function findChecklistTarget(
  blocks: readonly NoteBlock[],
): ChecklistTarget | null {
  if (blocks.length !== 1) return null;
  const [block] = blocks;
  if (!block || block.type !== "checkListItem") return null;

  const nodes = inlineNodes(block.content);
  const taskLink = nodes.find(
    (node) => node.type === "link" && node.href && taskIdFromHref(node.href),
  );
  const text = plainText(nodes.filter((node) => node !== taskLink)).trim();
  if (!text && !taskLink) return null;

  return {
    blockId: block.id,
    text,
    taskId: taskLink?.href ? taskIdFromHref(taskLink.href) : null,
    taskKey: taskLink ? plainText(taskLink.content ?? []) : null,
  };
}

// The task key is appended as a link: a visible mark that also opens the task.
export function withTaskLink(
  content: unknown,
  task: { key: string; link: string },
): InlineNode[] {
  return [
    ...inlineNodes(content),
    { type: "text", text: " ", styles: {} },
    {
      type: "link",
      href: task.link,
      content: [{ type: "text", text: task.key, styles: {} }],
    },
  ];
}
