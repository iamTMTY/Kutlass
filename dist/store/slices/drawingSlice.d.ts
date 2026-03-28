export type DrawingTool = "pen" | "eraser";
export interface Stroke {
    id: string;
    tool: DrawingTool;
    color: string;
    width: number;
    points: {
        x: number;
        y: number;
    }[];
}
export interface DrawingState {
    strokes: Stroke[];
    drawingTool: DrawingTool;
    drawingColor: string;
    drawingWidth: number;
}
export interface DrawingActions {
    addStroke: (stroke: Stroke) => void;
    undoStroke: () => void;
    clearStrokes: () => void;
    setDrawingTool: (tool: DrawingTool) => void;
    setDrawingColor: (color: string) => void;
    setDrawingWidth: (width: number) => void;
}
type Set = (fn: (s: DrawingState & DrawingActions) => Partial<DrawingState & DrawingActions>) => void;
export declare function createDrawingSlice(set: Set): DrawingState & DrawingActions;
export {};
//# sourceMappingURL=drawingSlice.d.ts.map