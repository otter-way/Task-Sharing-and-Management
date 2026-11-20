// The slice of an Excalidraw element the whiteboard reads. Excalidraw's own
// element types satisfy it, so the helpers stay testable without the editor.
export type BoardElement = {
  id: string;
  type: string;
  version: number;
  versionNonce?: number;
  updated?: number;
  isDeleted: boolean;
  text?: string;
  originalText?: string;
  containerId?: string | null;
  boundElements?: readonly { id: string; type: string }[] | null;
  link?: string | null;
  fileId?: string | null;
  customData?: Record<string, unknown>;
};

export const TASK_ID_FIELD = "kaneoTaskId";
export const TASK_KEY_FIELD = "kaneoTaskKey";
