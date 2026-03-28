export type TrackType = "video" | "audio" | "text" | "effects";
export interface EffectParams {
    brightness: number;
    contrast: number;
    saturation: number;
    rotation: number;
    cropX: number;
    cropY: number;
    cropW: number;
    cropH: number;
    opacity: number;
}
export interface TextOverlay {
    id: string;
    type: "text";
    text: string;
    x: number;
    y: number;
    fontSize: number;
    color: string;
    fontFamily: string;
    bold: boolean;
}
export interface StickerOverlay {
    id: string;
    type: "sticker";
    emoji: string;
    imageUrl?: string;
    x: number;
    y: number;
    scale: number;
}
export type Overlay = TextOverlay | StickerOverlay;
export declare const DEFAULT_EFFECTS: EffectParams;
export interface Clip {
    id: string;
    trackId: string;
    name: string;
    file: File;
    startTime: number;
    duration: number;
    trimIn: number;
    trimOut: number;
    sourceDuration: number;
    width: number;
    height: number;
    fps: number;
    thumbnails: string[];
}
export interface Track {
    id: string;
    type: TrackType;
    name: string;
    muted: boolean;
    locked: boolean;
}
export interface ExportSettings {
    format: "mp4" | "webm";
    resolution: "original" | "1080p" | "720p" | "480p";
    fps: 24 | 30 | 60;
    bitrate: number;
}
export declare const DEFAULT_EXPORT_SETTINGS: ExportSettings;
export type ExportStatus = "idle" | "preparing" | "encoding" | "done" | "error";
//# sourceMappingURL=editor.d.ts.map