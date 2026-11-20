import { NotebookPen } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import type { NoteTemplateId } from "./note-templates";

export function NotesEmptyState({
  canCreate,
  creating,
  onCreate,
}: {
  canCreate: boolean;
  creating: boolean;
  onCreate: (template: NoteTemplateId) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-4 text-center">
      <NotebookPen
        aria-hidden="true"
        className="size-6 text-muted-foreground"
      />
      <div className="flex max-w-sm flex-col gap-1">
        <h2 className="font-semibold text-base text-foreground">
          {t("notes:empty.title")}
        </h2>
        <p className="text-muted-foreground text-sm">
          {t("notes:empty.description")}
        </p>
      </div>
      {canCreate && (
        <div className="flex flex-wrap justify-center gap-2">
          <Button
            type="button"
            size="sm"
            disabled={creating}
            onClick={() => onCreate("blank")}
          >
            {t("notes:blank")}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={creating}
            onClick={() => onCreate("weeklyMeeting")}
          >
            {t("notes:templates.weeklyMeeting.name")}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={creating}
            onClick={() => onCreate("brainstorm")}
          >
            {t("notes:templates.brainstorm.name")}
          </Button>
        </div>
      )}
    </div>
  );
}
