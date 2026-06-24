"use client";

import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import { EditorContent, useEditor } from "@tiptap/react";
import { Markdown } from "tiptap-markdown";
import { marked } from "marked";
import { useState } from "react";

interface Props {
  content: string;
  onChange: (markdown: string) => void;
}

export default function RichEditor({ content, onChange }: Props) {
  const [mode, setMode] = useState<"write" | "markdown">("write");
  const [rawMarkdown, setRawMarkdown] = useState(content);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Write your post…" }),
      Link.configure({ openOnClick: false }),
      Markdown.configure({ transformPastedText: true }),
    ],
    content,
    onUpdate({ editor }) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const md = (editor.storage as any).markdown.getMarkdown() as string;
      setRawMarkdown(md);
      onChange(md);
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-gray max-w-none min-h-64 px-4 py-3 focus:outline-none",
      },
    },
  });

  if (!editor) return null;

  function switchToMarkdown() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const md = (editor!.storage as any).markdown.getMarkdown() as string;
    setRawMarkdown(md);
    setMode("markdown");
  }

  function switchToWrite() {
    const html = marked(rawMarkdown, { async: false }) as string;
    editor!.commands.setContent(html);
    setMode("write");
  }

  const btn = (active: boolean) =>
    `px-2 py-1 text-xs rounded ${
      active
        ? "bg-gray-900 text-white"
        : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
    } disabled:opacity-40`;

  const tabBtn = (active: boolean) =>
    `px-2.5 py-0.5 text-xs rounded transition-colors ${
      active ? "bg-white shadow-sm text-gray-900 font-medium" : "text-gray-500 hover:text-gray-700"
    }`;

  return (
    <div className="rounded-md border border-gray-300 shadow-sm focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
      <div className="flex flex-wrap items-center justify-between gap-1 border-b border-gray-200 bg-gray-50 px-2 py-1.5 rounded-t-md">
        {mode === "write" ? (
          <div className="flex flex-wrap gap-1">
            <button type="button" className={btn(editor.isActive("bold"))} onClick={() => editor.chain().focus().toggleBold().run()}>B</button>
            <button type="button" className={btn(editor.isActive("italic"))} onClick={() => editor.chain().focus().toggleItalic().run()}><em>I</em></button>
            <button type="button" className={btn(editor.isActive("code"))} onClick={() => editor.chain().focus().toggleCode().run()}>{"</>"}</button>
            <span className="mx-1 border-l border-gray-200" />
            <button type="button" className={btn(editor.isActive("heading", { level: 2 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</button>
            <button type="button" className={btn(editor.isActive("heading", { level: 3 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</button>
            <span className="mx-1 border-l border-gray-200" />
            <button type="button" className={btn(editor.isActive("bulletList"))} onClick={() => editor.chain().focus().toggleBulletList().run()}>• List</button>
            <button type="button" className={btn(editor.isActive("orderedList"))} onClick={() => editor.chain().focus().toggleOrderedList().run()}>1. List</button>
            <button type="button" className={btn(editor.isActive("blockquote"))} onClick={() => editor.chain().focus().toggleBlockquote().run()}>"</button>
            <button type="button" className={btn(editor.isActive("codeBlock"))} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>Block</button>
            <span className="mx-1 border-l border-gray-200" />
            <button
              type="button"
              className={btn(editor.isActive("link"))}
              onClick={() => {
                const url = window.prompt("URL");
                if (url) editor.chain().focus().setLink({ href: url }).run();
                else editor.chain().focus().unsetLink().run();
              }}
            >
              Link
            </button>
            <span className="mx-1 border-l border-gray-200" />
            <button
              type="button"
              className={btn(false)}
              disabled={!editor.can().undo()}
              onClick={() => editor.chain().focus().undo().run()}
            >
              ↩
            </button>
            <button
              type="button"
              className={btn(false)}
              disabled={!editor.can().redo()}
              onClick={() => editor.chain().focus().redo().run()}
            >
              ↪
            </button>
          </div>
        ) : (
          <span className="px-1 text-xs text-gray-400 font-mono">Markdown</span>
        )}

        <div className="ml-auto flex gap-0.5 rounded-md border border-gray-200 bg-gray-100 p-0.5">
          <button type="button" onClick={switchToWrite} className={tabBtn(mode === "write")}>Write</button>
          <button type="button" onClick={switchToMarkdown} className={tabBtn(mode === "markdown")}>Markdown</button>
        </div>
      </div>

      {mode === "write" ? (
        <EditorContent editor={editor} />
      ) : (
        <textarea
          value={rawMarkdown}
          onChange={(e) => {
            setRawMarkdown(e.target.value);
            onChange(e.target.value);
          }}
          className="w-full min-h-64 px-4 py-3 font-mono text-sm focus:outline-none resize-y"
          placeholder="Write markdown here…"
          spellCheck={false}
        />
      )}
    </div>
  );
}
