"use client";

import { useEditorStore } from "@/store/editorStore";
import { formatTime } from "@/lib/timeline/timeUtils";

export function PlaybackControls() {
  const isPlaying = useEditorStore((s) => s.isPlaying);
  const togglePlay = useEditorStore((s) => s.togglePlay);
  const currentTime = useEditorStore((s) => s.currentTime);
  const duration = useEditorStore((s) => s.duration);
  const setCurrentTime = useEditorStore((s) => s.setCurrentTime);

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-zinc-900/80 backdrop-blur-sm border-t border-zinc-800">
      {/* Rewind */}
      <button
        onClick={() => setCurrentTime(0)}
        className="text-zinc-400 hover:text-white transition-colors"
        title="Go to start (Home)"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
        </svg>
      </button>

      {/* Play / Pause */}
      <button
        onClick={togglePlay}
        className="w-9 h-9 rounded-full bg-violet-600 hover:bg-violet-500 flex items-center justify-center transition-colors text-white shadow-lg"
        title="Play/Pause (Space)"
        disabled={duration === 0}
      >
        {isPlaying ? (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-4 h-4 translate-x-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
        )}
      </button>

      {/* Forward to end */}
      <button
        onClick={() => setCurrentTime(duration)}
        className="text-zinc-400 hover:text-white transition-colors"
        title="Go to end (End)"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798L4.555 5.168z" />
        </svg>
      </button>

      {/* Time display */}
      <div className="ml-2 flex items-center gap-1.5 font-mono text-sm">
        <span className="text-white">{formatTime(currentTime)}</span>
        <span className="text-zinc-600">/</span>
        <span className="text-zinc-500">{formatTime(duration)}</span>
      </div>

      {/* Progress bar */}
      <div className="flex-1 mx-2">
        <div className="relative h-1.5 bg-zinc-700 rounded-full cursor-pointer group">
          <div
            className="h-full bg-violet-500 rounded-full transition-all"
            style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : "0%" }}
          />
          <input
            type="range"
            min={0}
            max={duration || 1}
            step={0.001}
            value={currentTime}
            onChange={(e) => setCurrentTime(Number(e.target.value))}
            className="absolute inset-0 w-full opacity-0 cursor-pointer h-1.5"
          />
        </div>
      </div>
    </div>
  );
}
