"use client";

import { useEditorStore } from "@/store/editorStore";
import { ExportSettings } from "@/types/editor";

const RESOLUTIONS: { label: string; value: ExportSettings["resolution"]; desc: string }[] = [
  { label: "Original", value: "original", desc: "Keep source resolution" },
  { label: "1080p", value: "1080p", desc: "1920 × 1080" },
  { label: "720p", value: "720p", desc: "1280 × 720" },
  { label: "480p", value: "480p", desc: "854 × 480" },
];

const FPS_OPTIONS: { label: string; value: ExportSettings["fps"] }[] = [
  { label: "24 fps", value: 24 },
  { label: "30 fps", value: 30 },
  { label: "60 fps", value: 60 },
];

export function ResizePanel() {
  const settings = useEditorStore((s) => s.settings);
  const updateSettings = useEditorStore((s) => s.updateExportSettings);

  return (
    <div className="shrink-0 border-t border-white/[0.06] bg-[#1a1a1a] px-5 py-3" style={{ height: 120 }}>
      <div className="flex gap-8">
        {/* Resolution */}
        <div className="flex-1">
          <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Resolution</span>
          <div className="flex gap-1.5 mt-2 flex-wrap">
            {RESOLUTIONS.map((r) => (
              <button
                key={r.value}
                onClick={() => updateSettings({ resolution: r.value })}
                title={r.desc}
                className="px-2.5 py-1 rounded text-xs font-medium transition-colors"
                style={{
                  background: settings.resolution === r.value ? "rgba(251,191,36,0.15)" : "rgba(255,255,255,0.05)",
                  color: settings.resolution === r.value ? "rgb(251,191,36)" : "rgb(161,161,170)",
                  border: `1px solid ${settings.resolution === r.value ? "rgba(251,191,36,0.4)" : "transparent"}`,
                }}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* FPS */}
        <div className="flex-1">
          <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Frame Rate</span>
          <div className="flex gap-1.5 mt-2">
            {FPS_OPTIONS.map((f) => (
              <button
                key={f.value}
                onClick={() => updateSettings({ fps: f.value })}
                className="px-2.5 py-1 rounded text-xs font-medium transition-colors"
                style={{
                  background: settings.fps === f.value ? "rgba(251,191,36,0.15)" : "rgba(255,255,255,0.05)",
                  color: settings.fps === f.value ? "rgb(251,191,36)" : "rgb(161,161,170)",
                  border: `1px solid ${settings.fps === f.value ? "rgba(251,191,36,0.4)" : "transparent"}`,
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Format */}
        <div className="flex-1">
          <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Format</span>
          <div className="flex gap-1.5 mt-2">
            {(["mp4", "webm"] as const).map((fmt) => (
              <button
                key={fmt}
                onClick={() => updateSettings({ format: fmt })}
                className="px-2.5 py-1 rounded text-xs font-medium uppercase transition-colors"
                style={{
                  background: settings.format === fmt ? "rgba(251,191,36,0.15)" : "rgba(255,255,255,0.05)",
                  color: settings.format === fmt ? "rgb(251,191,36)" : "rgb(161,161,170)",
                  border: `1px solid ${settings.format === fmt ? "rgba(251,191,36,0.4)" : "transparent"}`,
                }}
              >
                {fmt}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
