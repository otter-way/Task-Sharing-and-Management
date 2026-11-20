import { Download, ListPlus, SquareArrowOutUpRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import type { ConvertibleSelection } from "./find-convertible-selection";

type BoardActionsProps = {
  selection: ConvertibleSelection | null;
  canConvert: boolean;
  converting: boolean;
  canExport: boolean;
  onConvert: (selection: ConvertibleSelection) => void;
  onOpenTask: (taskId: string) => void;
  onExport: () => void;
};

// Shown in the project toolbar. The convert button follows the canvas
// selection, which changes many times a minute, so it appears without motion.
export function BoardActions({
  selection,
  canConvert,
  converting,
  canExport,
  onConvert,
  onOpenTask,
  onExport,
}: BoardActionsProps) {
  const { t } = useTranslation();

  return (
    <>
      {selection?.taskId ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => selection.taskId && onOpenTask(selection.taskId)}
        >
          <SquareArrowOutUpRight aria-hidden="true" />
          {selection.taskKey
            ? t("whiteboard:convert.openKey", { key: selection.taskKey })
            : t("whiteboard:convert.open")}
        </Button>
      ) : selection && canConvert ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={converting}
          onClick={() => onConvert(selection)}
        >
          <ListPlus aria-hidden="true" />
          {t("whiteboard:convert.button")}
        </Button>
      ) : null}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={!canExport}
        onClick={onExport}
        aria-label={t("whiteboard:export.png")}
      >
        <Download aria-hidden="true" />
        <span className="max-sm:sr-only">{t("whiteboard:export.png")}</span>
      </Button>
    </>
  );
}
