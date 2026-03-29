"use client";

import { useState } from "react";
import { Kutlass } from "kutlass";
import "kutlass/styles.css";

const ACCENTS = [
  { color: "#fbbf24", label: "Amber" },
  { color: "#8b5cf6", label: "Violet" },
  { color: "#3b82f6", label: "Blue" },
  { color: "#10b981", label: "Emerald" },
  { color: "#f43f5e", label: "Rose" },
  { color: "#f97316", label: "Orange" },
  { color: "#06b6d4", label: "Cyan" },
  { color: "#ec4899", label: "Pink" },
];

export function EditorDemo({ theme }: { theme: "dark" | "light" }) {
  const [accent, setAccent] = useState<string | undefined>(undefined);

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-3 justify-end">
        {ACCENTS.map((a) => (
          <button
            key={a.color}
            onClick={() => setAccent(accent === a.color ? undefined : a.color)}
            title={a.label}
            className="w-5 h-5 rounded-full transition-transform hover:scale-110"
            style={{
              background: a.color,
              boxShadow: accent === a.color ? `0 0 0 2px ${theme === "dark" ? "#09090b" : "#fafafa"}, 0 0 0 4px ${a.color}` : undefined,
            }}
          />
        ))}
      </div>
      <div className="w-full aspect-video max-h-[700px] rounded-2xl overflow-hidden shadow-2xl shadow-black/60 ring-1 ring-white/[0.08]">
        <Kutlass theme={theme} accent={accent} />
      </div>
    </div>
  );
}
