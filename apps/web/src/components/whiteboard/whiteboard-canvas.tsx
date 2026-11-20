import "@excalidraw/excalidraw/index.css";
import "./whiteboard-theme.css";
import { Excalidraw, MainMenu, WelcomeScreen } from "@excalidraw/excalidraw";
import type { ExcalidrawProps } from "@excalidraw/excalidraw/types";

declare global {
  interface Window {
    EXCALIDRAW_ASSET_PATH?: string | string[];
  }
}

// Drawing fonts are served by the app (see vite-plugins/excalidraw-fonts.ts).
// This must be set before the editor first renders text.
window.EXCALIDRAW_ASSET_PATH = new URL(
  `${import.meta.env.BASE_URL}excalidraw/`,
  window.location.origin,
).href;

type WhiteboardCanvasProps = Pick<
  ExcalidrawProps,
  | "excalidrawAPI"
  | "initialData"
  | "onChange"
  | "onLinkOpen"
  | "viewModeEnabled"
  | "theme"
  | "langCode"
> & { emptyHeading: string };

export default function WhiteboardCanvas({
  emptyHeading,
  ...props
}: WhiteboardCanvasProps) {
  return (
    <div className="kaneo-whiteboard absolute inset-0">
      <Excalidraw
        {...props}
        UIOptions={{
          canvasActions: {
            loadScene: false,
            saveToActiveFile: false,
            export: false,
            toggleTheme: false,
          },
        }}
      >
        <MainMenu>
          <MainMenu.DefaultItems.SaveAsImage />
          <MainMenu.DefaultItems.SearchMenu />
          <MainMenu.DefaultItems.Help />
          <MainMenu.DefaultItems.ClearCanvas />
          <MainMenu.Separator />
          <MainMenu.DefaultItems.ChangeCanvasBackground />
        </MainMenu>
        <WelcomeScreen>
          <WelcomeScreen.Hints.MenuHint />
          <WelcomeScreen.Hints.ToolbarHint />
          <WelcomeScreen.Hints.HelpHint />
          <WelcomeScreen.Center>
            <WelcomeScreen.Center.Heading>
              {emptyHeading}
            </WelcomeScreen.Center.Heading>
          </WelcomeScreen.Center>
        </WelcomeScreen>
      </Excalidraw>
    </div>
  );
}
