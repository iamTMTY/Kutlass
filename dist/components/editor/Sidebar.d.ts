export type Tool = "trim" | "crop" | "finetune" | "filter" | "annotate" | "sticker" | "resize";
interface SidebarProps {
    activeTool: Tool;
    onToolChange: (tool: Tool) => void;
}
export declare function Sidebar({ activeTool, onToolChange }: SidebarProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=Sidebar.d.ts.map