import "@blocknote/shadcn/style.css";
import "./note-editor.css";
import {
  BlockNoteSchema,
  type Dictionary,
  defaultBlockSpecs,
} from "@blocknote/core";
import * as locales from "@blocknote/core/locales";
import {
  type DefaultReactSuggestionItem,
  getDefaultReactSlashMenuItems,
  SuggestionMenuController,
  useCreateBlockNote,
} from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { imageToDataUrl } from "./image-to-data-url";
import { filterNoteSlashItems, noteSlashItems } from "./note-slash-items";

// Notes keep to everyday writing blocks. Files, audio and video are left out:
// they would need file storage, which a small install may not have.
export const noteSchema = BlockNoteSchema.create({
  blockSpecs: {
    paragraph: defaultBlockSpecs.paragraph,
    heading: defaultBlockSpecs.heading,
    quote: defaultBlockSpecs.quote,
    bulletListItem: defaultBlockSpecs.bulletListItem,
    numberedListItem: defaultBlockSpecs.numberedListItem,
    checkListItem: defaultBlockSpecs.checkListItem,
    table: defaultBlockSpecs.table,
    image: defaultBlockSpecs.image,
  },
});

export type NoteEditorInstance = typeof noteSchema.BlockNoteEditor;

function baseDictionary(language: string): Dictionary {
  const code = language.toLowerCase().split("-")[0] ?? "en";
  return (locales as unknown as Record<string, Dictionary>)[code] ?? locales.en;
}

type NoteEditorProps = {
  initialContent: unknown[];
  editable: boolean;
  theme: "light" | "dark";
  onReady: (editor: NoteEditorInstance) => void;
  onChange: () => void;
  onSelectionChange: () => void;
  onImageRejected: () => void;
};

export default function NoteEditor({
  initialContent,
  editable,
  theme,
  onReady,
  onChange,
  onSelectionChange,
  onImageRejected,
}: NoteEditorProps) {
  const { t, i18n } = useTranslation();

  const editor = useCreateBlockNote(
    {
      schema: noteSchema,
      dictionary: (() => {
        const base = baseDictionary(i18n.language);
        const menu = base.slash_menu;
        return {
          ...base,
          slash_menu: {
            ...menu,
            bullet_list: {
              ...menu.bullet_list,
              title: t("notes:slash.bulletList"),
            },
            check_list: {
              ...menu.check_list,
              title: t("notes:slash.checkList"),
              subtext: t("notes:slash.checkListSubtext"),
              aliases: [...menu.check_list.aliases, "yapılacak", "todo"],
            },
            image: {
              ...menu.image,
              title: t("notes:slash.image"),
              subtext: t("notes:slash.imageSubtext"),
            },
          },
        };
      })(),
      initialContent:
        initialContent.length > 0
          ? (initialContent as NonNullable<
              Parameters<typeof useCreateBlockNote>[0]
            >["initialContent"])
          : undefined,
      uploadFile: async (file) => {
        try {
          return await imageToDataUrl(file);
        } catch (error) {
          onImageRejected();
          throw error;
        }
      },
    },
    [],
  );

  useEffect(() => {
    onReady(editor as unknown as NoteEditorInstance);
  }, [editor, onReady]);

  return (
    <BlockNoteView
      editor={editor}
      editable={editable}
      theme={theme}
      slashMenu={false}
      onChange={onChange}
      onSelectionChange={onSelectionChange}
      className="kaneo-note"
    >
      <SuggestionMenuController
        triggerCharacter="/"
        getItems={async (query) =>
          filterNoteSlashItems(
            // Items carry their dictionary key at runtime; the type omits it.
            noteSlashItems(
              getDefaultReactSlashMenuItems(
                editor,
              ) as (DefaultReactSuggestionItem & {
                key: string;
              })[],
            ),
            query,
          )
        }
      />
    </BlockNoteView>
  );
}
