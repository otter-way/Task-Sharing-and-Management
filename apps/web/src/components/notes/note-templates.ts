export type NoteTemplateId = "blank" | "weeklyMeeting" | "brainstorm";

// The editor accepts these partial blocks and fills in ids and defaults.
export type TemplateBlock = {
  type: "heading" | "paragraph" | "bulletListItem" | "checkListItem";
  props?: Record<string, unknown>;
  content?: string;
};

type Translate = (key: string) => string;

const heading = (text: string): TemplateBlock => ({
  type: "heading",
  props: { level: 2 },
  content: text,
});

export function buildNoteTemplate(
  id: NoteTemplateId,
  t: Translate,
  today: string,
): { title: string; content: TemplateBlock[] } {
  if (id === "weeklyMeeting") {
    const key = "notes:templates.weeklyMeeting";
    return {
      title: `${t(`${key}.name`)} · ${today}`,
      content: [
        heading(t(`${key}.agenda`)),
        { type: "bulletListItem" },
        heading(t(`${key}.decisions`)),
        { type: "bulletListItem" },
        heading(t(`${key}.actionItems`)),
        { type: "checkListItem", props: { checked: false } },
      ],
    };
  }
  if (id === "brainstorm") {
    const key = "notes:templates.brainstorm";
    return {
      title: `${t(`${key}.name`)} · ${today}`,
      content: [
        heading(t(`${key}.topic`)),
        { type: "paragraph" },
        heading(t(`${key}.ideas`)),
        { type: "bulletListItem" },
        heading(t(`${key}.highlights`)),
        { type: "bulletListItem" },
        heading(t(`${key}.nextSteps`)),
        { type: "checkListItem", props: { checked: false } },
      ],
    };
  }
  return { title: "", content: [] };
}
