"use client";

import { useEditorStore } from "@/store/editorStore";
import { DEFAULT_EFFECTS, EffectParams } from "@/types/editor";

interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onValueChange: (v: number) => void;
  onPointerDown?: () => void;
  displayValue?: string;
}

function SliderRow({ label, value, min, max, onValueChange, onPointerDown, displayValue }: SliderRowProps) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-zinc-400 w-20 shrink-0">{label}</span>
      <div className="relative flex-1 h-5 flex items-center">
        <div className="absolute inset-x-0 h-1 rounded-full bg-zinc-700">
          <div className="h-full rounded-full bg-white/60" style={{ width: `${pct}%` }} />
        </div>
        <div
          className="absolute w-3.5 h-3.5 rounded-full bg-white shadow-md pointer-events-none"
          style={{ left: `calc(${pct}% - 7px)` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onValueChange(Number(e.target.value))}
          onPointerDown={onPointerDown}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-5"
        />
      </div>
      <span className="text-xs text-zinc-400 w-8 text-right tabular-nums shrink-0">
        {displayValue ?? value}
      </span>
    </div>
  );
}

export function FinetunePanel() {
  const selectedClipId = useEditorStore((s) => s.selectedClipId);
  const clipEffects = useEditorStore((s) => s.clipEffects);
  const setClipEffect = useEditorStore((s) => s.setClipEffect);
  const resetClipEffects = useEditorStore((s) => s.resetClipEffects);
  const captureHistory = useEditorStore((s) => s.captureHistory);
  const clips = useEditorStore((s) => s.clips);

  // Use first video clip if none selected
  const targetId = selectedClipId ?? clips.find((c) => c.trackId === "track-video")?.id ?? null;
  const effects: EffectParams = targetId ? (clipEffects[targetId] ?? DEFAULT_EFFECTS) : DEFAULT_EFFECTS;

  const set = (key: keyof EffectParams, v: number) => {
    if (targetId) setClipEffect(targetId, key, v);
  };

  const handleSliderPointerDown = () => captureHistory();

  return (
    <div className="shrink-0 border-t border-white/[0.06] bg-[#1a1a1a] px-6 py-4" style={{ height: 180 }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Adjustments</span>
        {targetId && (
          <button
            onClick={() => resetClipEffects(targetId)}
            className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Reset
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-x-8 gap-y-2.5">
        <SliderRow
          label="Brightness"
          value={effects.brightness}
          min={-100}
          max={100}
          onValueChange={(v) => set("brightness", v)}
          onPointerDown={handleSliderPointerDown}
        />
        <SliderRow
          label="Contrast"
          value={effects.contrast}
          min={-100}
          max={100}
          onValueChange={(v) => set("contrast", v)}
          onPointerDown={handleSliderPointerDown}
        />
        <SliderRow
          label="Saturation"
          value={effects.saturation}
          min={-100}
          max={100}
          onValueChange={(v) => set("saturation", v)}
          onPointerDown={handleSliderPointerDown}
        />
        <SliderRow
          label="Rotation"
          value={effects.rotation}
          min={-180}
          max={180}
          displayValue={`${effects.rotation}°`}
          onValueChange={(v) => set("rotation", v)}
          onPointerDown={handleSliderPointerDown}
        />
        <SliderRow
          label="Opacity"
          value={Math.round(effects.opacity * 100)}
          min={0}
          max={100}
          displayValue={`${Math.round(effects.opacity * 100)}%`}
          onValueChange={(v) => set("opacity", v / 100)}
          onPointerDown={handleSliderPointerDown}
        />
      </div>
    </div>
  );
}
