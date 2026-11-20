import type { ReactNode } from "react";

export function WhiteboardMessage({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}
