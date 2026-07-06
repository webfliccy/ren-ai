"use client";

import { inputClass, labelBlockClass } from "@/lib/styles";
import dynamic from "next/dynamic";
import { useState } from "react";

const RichEditor = dynamic(() => import("@/components/RichEditor"), {
  ssr: false,
});

interface Props {
  initialTitle: string;
  initialContent: string;
  initialTokens: string;
  initialPrompt: string;
}

export default function AboutForm({
  initialTitle,
  initialContent,
  initialTokens,
  initialPrompt,
}: Props) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [tokens, setTokens] = useState(initialTokens);
  const [prompt, setPrompt] = useState(initialPrompt);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );

  async function handleSave() {
    setStatus("saving");
    try {
      const res = await fetch("/api/pages/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, tokens, prompt }),
      });
      setStatus(res.ok ? "saved" : "error");
      if (res.ok) setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <label className={labelBlockClass}>Page title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="About the Fan"
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelBlockClass}>Content</label>
        <RichEditor content={content} onChange={setContent} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelBlockClass}>Tokens</label>
          <input
            type="text"
            value={tokens}
            onChange={(e) => setTokens(e.target.value)}
            placeholder="e.g. 4,200"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelBlockClass}>Prompt (for spec sheet)</label>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="The prompt used to draft this page"
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={status === "saving"}
          className="rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {status === "saving" ? "Saving…" : "Save"}
        </button>
        {status === "saved" && (
          <span className="text-sm text-green-600">Saved.</span>
        )}
        {status === "error" && (
          <span className="text-sm text-red-600">Save failed — try again.</span>
        )}
      </div>
    </div>
  );
}
