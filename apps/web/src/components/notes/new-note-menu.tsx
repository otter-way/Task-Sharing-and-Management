import { ChevronDown, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Menu, MenuItem, MenuPopup, MenuTrigger } from "@/components/ui/menu";
import type { NoteTemplateId } from "./note-templates";

const TEMPLATE_LABELS: Record<NoteTemplateId, string> = {
  blank: "notes:blank",
  weeklyMeeting: "notes:templates.weeklyMeeting.name",
  brainstorm: "notes:templates.brainstorm.name",
};

export function NewNoteMenu({
  disabled,
  onCreate,
  variant = "outline",
}: {
  disabled: boolean;
  onCreate: (template: NoteTemplateId) => void;
  variant?: "outline" | "default";
}) {
  const { t } = useTranslation();

  return (
    <Menu>
      <MenuTrigger
        render={
          <Button
            type="button"
            variant={variant}
            size="sm"
            disabled={disabled}
          />
        }
      >
        <Plus aria-hidden="true" />
        {t("notes:newNote")}
        <ChevronDown aria-hidden="true" className="opacity-64" />
      </MenuTrigger>
      <MenuPopup align="start">
        {(Object.keys(TEMPLATE_LABELS) as NoteTemplateId[]).map((id) => (
          <MenuItem key={id} onClick={() => onCreate(id)}>
            {t(TEMPLATE_LABELS[id])}
          </MenuItem>
        ))}
      </MenuPopup>
    </Menu>
  );
}
