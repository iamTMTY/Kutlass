import { type FFmpegPaths } from "./ffmpegConfig";
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
export declare function CutlassEditor({ className, style, exportSettings, ffmpegPaths, onExportComplete, }: CutlassEditorProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=CutlassEditor.d.ts.map