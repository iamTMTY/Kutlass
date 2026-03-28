import { Overlay, TextOverlay, StickerOverlay } from "@/types/editor";
export interface OverlaysState {
    overlays: Overlay[];
    selectedOverlayId: string | null;
}
export interface OverlaysActions {
    addTextOverlay: (overlay: Omit<TextOverlay, "id" | "type">) => string;
    addStickerOverlay: (overlay: Omit<StickerOverlay, "id" | "type">) => string;
    updateOverlay: (id: string, updates: Partial<Omit<Overlay, "id" | "type">>) => void;
    removeOverlay: (id: string) => void;
    selectOverlay: (id: string | null) => void;
    clearOverlays: () => void;
}
export declare const createOverlaysSlice: (set: (fn: (state: OverlaysState & OverlaysActions) => Partial<OverlaysState & OverlaysActions>) => void) => OverlaysState & OverlaysActions;
//# sourceMappingURL=overlaysSlice.d.ts.map