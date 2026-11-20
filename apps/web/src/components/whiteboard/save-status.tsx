import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { formatSaveTime } from "./format-save-time";
import type { LastSave, SaveState } from "./use-whiteboard-autosave";

type SaveStatusProps = {
  state: SaveState;
  lastSave: LastSave;
  meId: string | undefined;
  readOnly: boolean;
  onRetry: () => void;
};

export function SaveStatus({
  state,
  lastSave,
  meId,
  readOnly,
  onRetry,
}: SaveStatusProps) {
  const { t, i18n } = useTranslation();
  const time = lastSave.at
    ? formatSaveTime(new Date(lastSave.at), new Date(), i18n.language)
    : null;
  const byOther = lastSave.by && lastSave.by.id !== meId;

  let message: string;
  if (state === "pending" || state === "saving") {
    message = t("whiteboard:status.saving");
  } else if (state === "failed") {
    message = t("whiteboard:status.failed");
  } else if (state === "tooLarge") {
    message = t("whiteboard:status.tooLarge");
  } else if (!time) {
    message = t("whiteboard:status.neverSaved");
  } else if (byOther) {
    message = t("whiteboard:status.savedBy", {
      name: lastSave.by?.name || t("whiteboard:teammate"),
      time,
    });
  } else {
    message = t("whiteboard:status.saved", { time });
  }

  const failed = state === "failed" || state === "tooLarge";

  return (
    <div className="flex min-w-0 items-center gap-1.5">
      {readOnly && (
        <span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
          {t("whiteboard:status.readOnly")}
        </span>
      )}
      <p
        role="status"
        aria-live="polite"
        className={cn(
          "truncate text-xs tabular-nums",
          failed ? "text-destructive-foreground" : "text-muted-foreground",
        )}
      >
        {message}
      </p>
      {state === "failed" && (
        <Button type="button" variant="ghost" size="xs" onClick={onRetry}>
          {t("whiteboard:retry")}
        </Button>
      )}
    </div>
  );
}
