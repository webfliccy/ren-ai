"use client";

import { ChicagoWebRef, EMPTY_REF } from "@/lib/references";
import { hintText, labelClass } from "@/lib/styles";

interface ReferenceListProps {
  references: ChicagoWebRef[];
  onChange: React.Dispatch<React.SetStateAction<ChicagoWebRef[]>>;
}

export function ReferenceList({ references, onChange }: ReferenceListProps) {
  function moveReference(i: number, delta: number) {
    onChange((r) => {
      const j = i + delta;
      if (j < 0 || j >= r.length) return r;
      const next = [...r];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className={labelClass}>
          References <span className={hintText}>(Chicago — web)</span>
        </label>
        <button
          type="button"
          onClick={() => onChange((r) => [...r, { ...EMPTY_REF }])}
          className="text-xs font-medium text-blue-600 hover:text-blue-800"
        >
          + Add reference
        </button>
      </div>
      {references.length > 0 && (
        <ol className="space-y-4 list-none">
          {references.map((ref, i) => {
            const field = (key: keyof ChicagoWebRef, placeholder: string, label: string) => (
              <div className="space-y-0.5">
                <span className="text-xs text-gray-400">{label}</span>
                <input
                  type="text"
                  value={ref[key]}
                  onChange={(e) =>
                    onChange((r) =>
                      r.map((v, j) => j === i ? { ...v, [key]: e.target.value } : v)
                    )
                  }
                  placeholder={placeholder}
                  className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            );
            return (
              <li key={i} className="rounded-md border border-gray-200 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-gray-400 select-none">{i + 1}.</span>
                    <button
                      type="button"
                      onClick={() => moveReference(i, -1)}
                      disabled={i === 0}
                      className="text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:hover:text-gray-400 text-xs leading-none"
                      aria-label="Move reference up"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={() => moveReference(i, 1)}
                      disabled={i === references.length - 1}
                      className="text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:hover:text-gray-400 text-xs leading-none"
                      aria-label="Move reference down"
                    >
                      ▼
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => onChange((r) => r.filter((_, j) => j !== i))}
                    className="text-gray-400 hover:text-red-500 text-lg leading-none"
                    aria-label="Remove reference"
                  >
                    ×
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {field("authorLast", "Doe", "Author last name")}
                  {field("authorFirst", "John", "Author first name")}
                </div>
                {field("pageTitle", "The History of Chicago Architecture", "Title of webpage")}
                {field("siteName", "Chicago Historical Society", "Name of website")}
                {field("date", "Last modified October 12, 2025", "Publication / revision date")}
                {field("url", "chicagohistory.org/...", "URL")}
              </li>
            );
          })}
        </ol>
      )}
      {references.length === 0 && (
        <p className="text-xs text-gray-400">No references yet — click &quot;+ Add reference&quot; to begin.</p>
      )}
    </div>
  );
}
