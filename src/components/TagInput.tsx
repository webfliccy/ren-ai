"use client";

import { useRef, useState } from "react";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

export function TagInput({ tags, onChange }: TagInputProps) {
  const [tagInput, setTagInput] = useState("");
  const tagInputRef = useRef<HTMLInputElement>(null);

  function addTag(value: string) {
    const normalized = value.trim().toLowerCase().replace(/\s+/g, "-");
    if (normalized && !tags.includes(normalized)) {
      onChange([...tags, normalized]);
    }
    setTagInput("");
  }

  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === "Backspace" && tagInput === "" && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  }

  return (
    <>
      <div
        className="flex min-h-9 w-full cursor-text flex-wrap items-center gap-1.5 rounded-md border border-gray-300 px-2 py-1.5 shadow-sm focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500"
        onClick={() => tagInputRef.current?.focus()}
      >
        {tags.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700"
          >
            {tag}
            <button
              type="button"
              onClick={() => onChange(tags.filter((x) => x !== tag))}
              className="text-blue-400 hover:text-blue-600"
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={tagInputRef}
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleTagKeyDown}
          onBlur={() => tagInput && addTag(tagInput)}
          placeholder={tags.length === 0 ? "Add tags (Enter to confirm)" : ""}
          className="min-w-24 flex-1 bg-transparent text-sm outline-none"
        />
      </div>
      <p className="text-xs text-gray-400">Press Enter or comma to add a tag</p>
    </>
  );
}
