"use client";

import { useEditorStore } from "@/store/editorStore";
import { DEFAULT_EFFECTS } from "@/types/editor";

interface AspectPreset {
  label: string;
  ratio: [number, number] | null; // null = free
}

const ASPECT_PRESETS: AspectPreset[] = [
  { label: "Free", ratio: null },
  { label: "16:9", ratio: [16, 9] },
  { label: "9:16", ratio: [9, 16] },
  { label: "4:3", ratio: [4, 3] },
  { label: "3:4", ratio: [3, 4] },
  { label: "1:1", ratio: [1, 1] },
];

export function CropPanel() {
  const selectedClipId = useEditorStore((s) => s.selectedClipId);
  const clips = useEditorStore((s) => s.clips);
  const clipEffects = useEditorStore((s) => s.clipEffects);
  const setClipEffects = useEditorStore((s) => s.setClipEffects);
  const resetClipEffects = useEditorStore((s) => s.resetClipEffects);
  const captureHistory = useEditorStore((s) => s.captureHistory);

  const targetId = selectedClipId ?? clips.find((c) => c.trackId === "track-video")?.id ?? null;
  const effects = targetId ? (clipEffects[targetId] ?? DEFAULT_EFFECTS) : DEFAULT_EFFECTS;

  const applyCrop = (ratio: [number, number] | null) => {
    if (!targetId) return;
    captureHistory();
    if (!ratio) {
      // Free — reset crop
      setClipEffects(targetId, { cropX: 0, cropY: 0, cropW: 1, cropH: 1 });
      return;
    }
    // Compute centered crop region for the given aspect ratio
    const clip = clips.find((c) => c.id === targetId);
    if (!clip) return;
    const videoAspect = clip.width / clip.height;
    const targetAspect = ratio[0] / ratio[1];

    let cropW = 1, cropH = 1, cropX = 0, cropY = 0;
    if (targetAspect < videoAspect) {
      // Crop left/right (pillarbox)
      cropW = (clip.height * targetAspect) / clip.width;
      cropX = (1 - cropW) / 2;
    } else {
      // Crop top/bottom (letterbox)
      cropH = (clip.width / targetAspect) / clip.height;
      cropY = (1 - cropH) / 2;
    }
    setClipEffects(targetId, { cropX, cropY, cropW, cropH });
  };

  const resetCrop = () => {
    if (!targetId) return;
    captureHistory();
    setClipEffects(targetId, { cropX: 0, cropY: 0, cropW: 1, cropH: 1 });
  };

  const isDefaultCrop =
    effects.cropX === 0 && effects.cropY === 0 && effects.cropW === 1 && effects.cropH === 1;

  return (
    <div className="shrink-0 border-t border-white/[0.06] bg-[#1a1a1a] px-5 py-3" style={{ height: 100 }}>
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Aspect Ratio</span>
        {!isDefaultCrop && (
          <button
            onClick={resetCrop}
            className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Reset
          </button>
        )}
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {ASPECT_PRESETS.map((preset) => {
          const isActive =
            preset.ratio === null
              ? isDefaultCrop
              : (() => {
                  if (!clips.find((c) => c.id === targetId)) return false;
                  const clip = clips.find((c) => c.id === targetId)!;
                  const videoAspect = clip.width / clip.height;
                  const targetAspect = preset.ratio[0] / preset.ratio[1];
                  let expectedW = 1, expectedH = 1, expectedX = 0, expectedY = 0;
                  if (targetAspect < videoAspect) {
                    expectedW = (clip.height * targetAspect) / clip.width;
                    expectedX = (1 - expectedW) / 2;
                  } else {
                    expectedH = (clip.width / targetAspect) / clip.height;
                    expectedY = (1 - expectedH) / 2;
                  }
                  return (
                    Math.abs(effects.cropX - expectedX) < 0.01 &&
                    Math.abs(effects.cropY - expectedY) < 0.01 &&
                    Math.abs(effects.cropW - expectedW) < 0.01 &&
                    Math.abs(effects.cropH - expectedH) < 0.01
                  );
                })();

          return (
            <button
              key={preset.label}
              onClick={() => applyCrop(preset.ratio)}
              className="px-2.5 py-1 rounded text-xs font-medium transition-colors"
              style={{
                background: isActive ? "rgba(251,191,36,0.15)" : "rgba(255,255,255,0.05)",
                color: isActive ? "rgb(251,191,36)" : "rgb(161,161,170)",
                border: `1px solid ${isActive ? "rgba(251,191,36,0.4)" : "transparent"}`,
              }}
            >
              {preset.label}
            </button>
          );
        })}
      </div>
      <p className="text-[10px] text-zinc-600 mt-2">Drag handles in preview to adjust crop freely</p>
    </div>
  );
}
