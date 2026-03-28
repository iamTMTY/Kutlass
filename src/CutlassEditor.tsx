"use client";

import { useEffect } from "react";
import { Editor } from "@/components/editor/Editor";
import { useEditorStore } from "@/store/editorStore";
import { setFFmpegPaths, type FFmpegPaths } from "./ffmpegConfig";

import type { ExportSettings } from "@/types/editor";
import type { Tool } from "@/components/editor/Sidebar";

export interface CutlassEditorProps {
  /** CSS class name for the outer container */
  className?: string;
  /** Inline styles for the outer container */
  style?: React.CSSProperties;
  /** Which tools to show in the sidebar. Defaults to all. */
  tools?: Tool[];
  /** Default export settings (format, resolution, fps, bitrate) */
  exportSettings?: Partial<ExportSettings>;
  /** Paths to the FFmpeg WASM files served from your public directory */
  ffmpegPaths?: Partial<FFmpegPaths>;
  /**
   * Called when export finishes successfully.
   * Receives the exported video as a Blob.
   */
  onExportComplete?: (blob: Blob) => void;
}

export function CutlassEditor({
  className,
  style,
  exportSettings,
  ffmpegPaths,
  onExportComplete,
}: CutlassEditorProps) {
  // Configure FFmpeg WASM paths before any export runs
  useEffect(() => {
    if (ffmpegPaths) setFFmpegPaths(ffmpegPaths);
  }, [ffmpegPaths]);

  // Apply export settings overrides
  useEffect(() => {
    if (exportSettings) {
      useEditorStore.getState().updateExportSettings(exportSettings);
    }
  }, [exportSettings]);

  // Watch for export completion and forward the blob
  useEffect(() => {
    if (!onExportComplete) return;
    return useEditorStore.subscribe((state, prev) => {
      if (state.status === "done" && prev.status !== "done" && state.outputUrl) {
        fetch(state.outputUrl)
          .then((r) => r.blob())
          .then((blob) => onExportComplete(blob))
          .catch(console.error);
      }
    });
  }, [onExportComplete]);

  return (
    <div
      className={className}
      style={{ width: "100%", height: "100%", ...style }}
    >
      <Editor />
    </div>
  );
}
