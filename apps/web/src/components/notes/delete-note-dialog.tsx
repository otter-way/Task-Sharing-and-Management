import { useTranslation } from "react-i18next";
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export function DeleteNoteDialog({
  title,
  open,
  deleting,
  onOpenChange,
  onConfirm,
}: {
  title: string;
  open: boolean;
  deleting: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  const { t } = useTranslation();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("notes:delete.title")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("notes:delete.description", { title })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogClose render={<Button variant="outline" size="sm" />}>
            {t("common:actions.cancel")}
          </AlertDialogClose>
          <Button
            variant="destructive"
            size="sm"
            disabled={deleting}
            onClick={onConfirm}
          >
            {deleting
              ? t("common:actions.deleting")
              : t("common:actions.delete")}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
