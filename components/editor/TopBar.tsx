"use client";

import { useRef } from "react";
import { useEditorStore } from "@/store/editorStore";
import { useExport } from "@/hooks/useExport";
import { useVideoImport } from "@/hooks/useVideoImport";

export function TopBar() {
  const zoom = useEditorStore((s) => s.zoom);
  const setZoom = useEditorStore((s) => s.setZoom);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const canUndo = useEditorStore((s) => s.past.length > 0);
  const canRedo = useEditorStore((s) => s.future.length > 0);
  const exportStatus = useEditorStore((s) => s.status);
  const clips = useEditorStore((s) => s.clips);
  const { startExport } = useExport();
  const { replaceImport } = useVideoImport();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isExporting = exportStatus === "preparing" || exportStatus === "encoding";
  const hasClips = clips.length > 0;
  const zoomPercent = Math.round((zoom / 80) * 100);

  return (
    <div className="flex items-center h-11 px-3 shrink-0 border-b border-white/[0.06]">
      {/* History */}
      <div className="flex items-center gap-1">
        <button
          onClick={undo}
          disabled={!canUndo}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title="Undo (⌘Z)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
          </svg>
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title="Redo (⌘⇧Z)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
          </svg>
        </button>
      </div>

      {/* Zoom */}
      <div className="flex items-center gap-1 mx-auto">
        <button
          onClick={() => setZoom(zoom / 1.25)}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors text-base leading-none"
        >
          -
        </button>
        <span className="text-xs text-zinc-300 font-medium w-10 text-center tabular-nums">
          {zoomPercent}%
        </span>
        <button
          onClick={() => setZoom(zoom * 1.25)}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors text-base leading-none"
        >
          +
        </button>
      </div>

      {/* Upload & Done */}
      <div className="flex items-center gap-2">
        {/* Hidden file input for upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []).filter((f) => f.type.startsWith("video/"));
            if (files.length > 0) replaceImport(files);
            e.target.value = "";
          }}
        />
        {hasClips && (
          <>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 h-8 rounded-lg bg-white/7 hover:bg-white/12 text-zinc-300 text-sm font-medium transition-colors flex items-center gap-1.5"
              title="Import new video"
            >
              Import Video
            </button>
            <button
              disabled={isExporting}
              onClick={startExport}
              className="px-4 h-8 rounded-lg bg-amber-400 hover:bg-amber-300 text-zinc-900 text-sm font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Done
            </button>
          </>
        )}
      </div>
    </div>
  );
}
