"use client";

import { useEditorStore } from "@/store/editorStore";
import { useShallow } from "zustand/react/shallow";
import { Track } from "@/types/editor";
import { ClipBlock } from "./ClipBlock";

interface TrackRowProps {
  track: Track;
  totalWidth: number;
}

const TRACK_ICONS: Record<string, string> = {
  video: "🎬",
  audio: "🎵",
  text: "T",
  effects: "✨",
};

export function TrackRow({ track, totalWidth }: TrackRowProps) {
  const clips = useEditorStore(useShallow((s) => s.clips.filter((c) => c.trackId === track.id)));

  return (
    <div className="flex h-12 border-b border-zinc-800/50">
      {/* Track label */}
      <div className="w-24 shrink-0 flex items-center gap-2 px-3 border-r border-zinc-800 bg-zinc-900/50">
        <span className="text-sm">{TRACK_ICONS[track.type] ?? "?"}</span>
        <span className="text-xs text-zinc-400 truncate">{track.name}</span>
      </div>

      {/* Clip area */}
      <div className="relative flex-1 bg-zinc-900/20 overflow-hidden" style={{ width: totalWidth }}>
        {clips.map((clip) => (
          <ClipBlock key={clip.id} clip={clip} />
        ))}
      </div>
    </div>
  );
}
