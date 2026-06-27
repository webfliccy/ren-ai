"use client";

import { Artefact } from "@/db/schema";

interface ArtefactListProps {
  artefacts: Artefact[];
  onUpdate: (i: number, field: keyof Artefact, value: string | number | null) => void;
  onRemove: (i: number) => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploading: boolean;
}

export function ArtefactList({ artefacts, onUpdate, onRemove, onUpload, uploading }: ArtefactListProps) {
  return (
    <>
      {artefacts.length > 0 && (
        <ol className="space-y-3 list-none">
          {artefacts.map((art, i) => (
            <li key={i} className="rounded border border-gray-200 p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-500">
                      {art.type || "file"}
                    </span>
                    <a
                      href={art.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-blue-600 hover:underline truncate"
                    >
                      {art.name}
                    </a>
                    {art.size != null && (
                      <span className="text-xs text-gray-400">
                        {art.size < 1024
                          ? `${art.size} B`
                          : art.size < 1048576
                          ? `${(art.size / 1024).toFixed(1)} KB`
                          : `${(art.size / 1048576).toFixed(1)} MB`}
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={art.description}
                    onChange={(e) => onUpdate(i, "description", e.target.value)}
                    placeholder="Description (optional)"
                    className="w-full rounded border border-gray-200 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(i)}
                  className="text-gray-400 hover:text-red-500 text-lg leading-none flex-shrink-0"
                  aria-label="Remove artefact"
                >
                  ×
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Upload artefact</label>
        <input
          type="file"
          onChange={onUpload}
          disabled={uploading}
          className="block w-full text-sm text-gray-500 file:mr-3 file:rounded-md file:border file:border-gray-300 file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-50 disabled:opacity-50"
        />
        {uploading && <p className="mt-1 text-xs text-gray-400">Uploading…</p>}
      </div>
    </>
  );
}
