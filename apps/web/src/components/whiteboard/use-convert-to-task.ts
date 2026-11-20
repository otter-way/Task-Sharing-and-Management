import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { useCreateTaskFromText } from "@/components/shared/convert-to-task/use-create-task-from-text";
import type { BoardElement } from "./board-element";
import type { ConvertibleSelection } from "./find-convertible-selection";
import { markAsTask } from "./mark-as-task";

export function useConvertToTask({
  api,
  ...options
}: {
  api: ExcalidrawImperativeAPI | null;
  projectId: string;
  workspaceId: string;
  projectSlug: string | undefined;
  onOpenTask: (taskId: string) => void;
}) {
  const { createFromText, creating } = useCreateTaskFromText(options);

  const convert = async (selection: ConvertibleSelection) => {
    if (!api) return;
    const task = await createFromText(selection.text);
    if (!task) return;
    api.updateScene({
      elements: markAsTask(
        api.getSceneElementsIncludingDeleted() as readonly BoardElement[],
        selection.targetId,
        task,
      ) as unknown as Parameters<
        ExcalidrawImperativeAPI["updateScene"]
      >[0]["elements"],
      captureUpdate: "IMMEDIATELY",
    });
  };

  return { convert, converting: creating };
}
