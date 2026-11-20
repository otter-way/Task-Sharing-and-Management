import { useCallback, useEffect, useRef, useState } from "react";
import { HttpError } from "@/lib/http-error";

// Save shortly after editing settles, but never hold edits back longer than
// MAX_WAIT_MS while someone keeps typing or drawing.
const DEBOUNCE_MS = 2000;
const MAX_WAIT_MS = 10_000;

export type SaveState =
  | "idle"
  | "pending"
  | "saving"
  | "saved"
  | "failed"
  | "tooLarge";

export type Editor = { id: string; name: string } | null;
export type LastSave = { at: Date | string | null; by: Editor };
export type Overwritten = { by: Editor; at: Date | string };
export type SaveResult = {
  version: number;
  updatedAt: string;
  overwritten: { updatedBy: Editor; updatedAt: string } | null;
};
export type Snapshot<P> = { signature: string; payload: P };

// Shared by the whiteboard and notes: one document saved whole, versioned on
// the server, where the last save wins and the saver hears whose newer work it
// replaced. Callers describe their document with a cheap `signature` that
// changes whenever the content does.
export function useAutosave<P>({
  enabled,
  initial,
  me,
  read,
  send,
  onSaved,
  onOverwritten,
}: {
  enabled: boolean;
  initial: {
    version: number;
    updatedAt: Date | string | null;
    updatedBy: Editor;
  };
  me: Editor;
  read: () => Snapshot<P> | null;
  send: (payload: P, baseVersion: number) => Promise<SaveResult>;
  onSaved?: (payload: P, result: SaveResult) => void;
  onOverwritten: (overwritten: Overwritten) => void;
}) {
  const baseVersion = useRef(initial.version);
  // Null until the editor reports its first, freshly loaded document.
  const savedSignature = useRef<string | null>(null);
  const latestSignature = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pendingSince = useRef<number | null>(null);
  const inFlight = useRef<Promise<void> | null>(null);
  const [state, setState] = useState<SaveState>("idle");
  const [lastSave, setLastSave] = useState<LastSave>({
    at: initial.updatedAt,
    by: initial.updatedBy,
  });

  const isDirty = useCallback(
    () =>
      inFlight.current !== null ||
      (latestSignature.current !== null &&
        latestSignature.current !== savedSignature.current),
    [],
  );

  const saveRef = useRef<() => Promise<void>>(async () => {});
  const schedule = useCallback(() => {
    const now = Date.now();
    pendingSince.current ??= now;
    clearTimeout(timer.current);
    const waited = now - pendingSince.current;
    timer.current = setTimeout(
      () => void saveRef.current(),
      Math.max(0, Math.min(DEBOUNCE_MS, MAX_WAIT_MS - waited)),
    );
  }, []);

  const save = useCallback(async (): Promise<void> => {
    clearTimeout(timer.current);
    pendingSince.current = null;
    if (!enabled) return;
    // One request at a time; the newest document is read after the wait.
    while (inFlight.current) await inFlight.current;
    const snapshot = read();
    if (!snapshot || snapshot.signature === savedSignature.current) return;

    setState("saving");
    const request = (async () => {
      try {
        const result = await send(snapshot.payload, baseVersion.current);
        baseVersion.current = result.version;
        savedSignature.current = snapshot.signature;
        setLastSave({ at: result.updatedAt, by: me });
        onSaved?.(snapshot.payload, result);
        if (result.overwritten) {
          onOverwritten({
            by: result.overwritten.updatedBy,
            at: result.overwritten.updatedAt,
          });
        }
        if (latestSignature.current === snapshot.signature) {
          setState("saved");
        } else {
          setState("pending");
          schedule();
        }
      } catch (error) {
        setState(
          error instanceof HttpError && error.status === 413
            ? "tooLarge"
            : "failed",
        );
      }
    })();

    inFlight.current = request;
    await request;
    inFlight.current = null;
  }, [enabled, me, onOverwritten, onSaved, read, schedule, send]);

  useEffect(() => {
    saveRef.current = save;
  }, [save]);

  const notifyChange = useCallback(
    (signature: string) => {
      latestSignature.current = signature;
      if (savedSignature.current === null) {
        savedSignature.current = signature;
        return;
      }
      if (!enabled || signature === savedSignature.current) return;
      setState((current) => (current === "saving" ? current : "pending"));
      schedule();
    },
    [enabled, schedule],
  );

  // Called after the editor loads someone else's save: that document is now
  // the saved state, and nothing local is waiting.
  const adopt = useCallback(
    (
      next: {
        version: number;
        updatedAt: Date | string | null;
        updatedBy: Editor;
      },
      signature: string | null,
    ) => {
      clearTimeout(timer.current);
      pendingSince.current = null;
      baseVersion.current = next.version;
      savedSignature.current = signature;
      latestSignature.current = signature;
      setLastSave({ at: next.updatedAt, by: next.updatedBy });
      setState("saved");
    },
    [],
  );

  const getBaseVersion = useCallback(() => baseVersion.current, []);

  // Leaving saves what is pending, and the browser asks before a reload or
  // tab close would drop it.
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (enabled && isDirty()) event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => {
      window.removeEventListener("beforeunload", warn);
      if (pendingSince.current !== null) void save();
      clearTimeout(timer.current);
    };
  }, [enabled, isDirty, save]);

  return {
    state,
    lastSave,
    notifyChange,
    saveNow: save,
    adopt,
    isDirty,
    baseVersion: getBaseVersion,
  };
}
