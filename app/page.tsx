import { Editor } from "@/components/editor/Editor";

export default function Home() {
  return (
    <div className="w-screen h-screen flex items-center justify-center bg-zinc-950 p-6">
      <div className="w-full h-full max-w-6xl max-h-[800px] rounded-xl overflow-hidden shadow-2xl shadow-black/60 ring-1 ring-white/10">
        <Editor />
      </div>
    </div>
  );
}
