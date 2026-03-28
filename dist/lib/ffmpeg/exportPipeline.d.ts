import { Clip, ExportSettings, EffectParams, Overlay } from "@/types/editor";
import { Stroke } from "@/store/slices/drawingSlice";
export interface ExportJob {
    clips: Clip[];
    settings: ExportSettings;
    effectsMap: Record<string, EffectParams>;
    strokes: Stroke[];
    overlays: Overlay[];
    onProgress: (progress: number) => void;
    signal?: AbortSignal;
}
export declare function runExport(job: ExportJob): Promise<Uint8Array>;
//# sourceMappingURL=exportPipeline.d.ts.map