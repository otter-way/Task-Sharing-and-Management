import { ListPlus, MoreHorizontal, SquareArrowOutUpRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Menu, MenuItem, MenuPopup, MenuTrigger } from "@/components/ui/menu";
import type { ChecklistTarget } from "./checklist-task";

type NoteActionsProps = {
  target: ChecklistTarget | null;
  canConvert: boolean;
  converting: boolean;
  canDelete: boolean;
  onConvert: (target: ChecklistTarget) => void;
  onOpenTask: (taskId: string) => void;
  onDelete: () => void;
};

// Shown in the project toolbar. The convert button follows the cursor, which
// moves constantly, so it appears without motion.
export function NoteActions({
  target,
  canConvert,
  converting,
  canDelete,
  onConvert,
  onOpenTask,
  onDelete,
}: NoteActionsProps) {
  const { t } = useTranslation();

  return (
    <>
      {target?.taskId ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => target.taskId && onOpenTask(target.taskId)}
        >
          <SquareArrowOutUpRight aria-hidden="true" />
          {target.taskKey
            ? t("tasks:convertToTask.openKey", { key: target.taskKey })
            : t("tasks:convertToTask.open")}
        </Button>
      ) : target?.text && canConvert ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={converting}
          onClick={() => onConvert(target)}
        >
          <ListPlus aria-hidden="true" />
          {t("tasks:convertToTask.button")}
        </Button>
      ) : null}
      {canDelete && (
        <Menu>
          <MenuTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={t("notes:options")}
              />
            }
          >
            <MoreHorizontal aria-hidden="true" />
          </MenuTrigger>
          <MenuPopup align="end">
            <MenuItem variant="destructive" onClick={onDelete}>
              {t("notes:delete.button")}
            </MenuItem>
          </MenuPopup>
        </Menu>
      )}
    </>
  );
}
