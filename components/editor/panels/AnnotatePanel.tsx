"use client";

import { useEditorStore } from "@/store/editorStore";

const COLORS = ["#ff0000", "#ff9900", "#ffff00", "#00ff00", "#00cfff", "#ffffff", "#000000"];
const WIDTHS = [2, 4, 8, 16];

export function AnnotatePanel() {
  const drawingTool = useEditorStore((s) => s.drawingTool);
  const drawingColor = useEditorStore((s) => s.drawingColor);
  const drawingWidth = useEditorStore((s) => s.drawingWidth);
  const setDrawingTool = useEditorStore((s) => s.setDrawingTool);
  const setDrawingColor = useEditorStore((s) => s.setDrawingColor);
  const setDrawingWidth = useEditorStore((s) => s.setDrawingWidth);
  const undoStroke = useEditorStore((s) => s.undoStroke);
  const clearStrokes = useEditorStore((s) => s.clearStrokes);
  const strokes = useEditorStore((s) => s.strokes);

  return (
    <div className="shrink-0 border-t border-white/[0.06] bg-[#1a1a1a] px-5 py-3" style={{ height: 90 }}>
      <div className="flex items-center gap-6 h-full">

        {/* Tool selector */}
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider">Tool</span>
          <div className="flex gap-1">
            <button
              onClick={() => setDrawingTool("pen")}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                drawingTool === "pen"
                  ? "bg-amber-400 text-black"
                  : "bg-white/[0.07] text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Pen
            </button>
            <button
              onClick={() => setDrawingTool("eraser")}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                drawingTool === "eraser"
                  ? "bg-amber-400 text-black"
                  : "bg-white/[0.07] text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Eraser
            </button>
          </div>
        </div>

        {/* Color swatches */}
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider">Color</span>
          <div className="flex gap-1.5">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setDrawingColor(c)}
                className="w-5 h-5 rounded-full border-2 transition-transform hover:scale-110"
                style={{
                  background: c,
                  borderColor: drawingColor === c ? "white" : "transparent",
                  boxShadow: c === "#ffffff" ? "inset 0 0 0 1px rgba(255,255,255,0.3)" : undefined,
                }}
              />
            ))}
          </div>
        </div>

        {/* Stroke width */}
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider">Width</span>
          <div className="flex gap-1 items-center">
            {WIDTHS.map((w) => (
              <button
                key={w}
                onClick={() => setDrawingWidth(w)}
                className={`flex items-center justify-center w-8 h-7 rounded transition-colors ${
                  drawingWidth === w ? "bg-amber-400/20 ring-1 ring-amber-400" : "bg-white/[0.07] hover:bg-white/[0.12]"
                }`}
              >
                <div
                  className="rounded-full bg-white"
                  style={{ width: Math.min(w * 2, 20), height: Math.min(w / 2 + 2, 8) }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1 ml-auto">
          <span className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider">Actions</span>
          <div className="flex gap-1">
            <button
              onClick={undoStroke}
              disabled={strokes.length === 0}
              className="px-3 py-1.5 rounded text-xs font-medium bg-white/[0.07] text-zinc-400 hover:text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Undo
            </button>
            <button
              onClick={clearStrokes}
              disabled={strokes.length === 0}
              className="px-3 py-1.5 rounded text-xs font-medium bg-white/[0.07] text-red-400/80 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
