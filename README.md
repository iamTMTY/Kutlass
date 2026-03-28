# Kutlass

A fully client-side browser video editor React component. All video processing — decoding, effects, cropping, annotations, and encoding — runs entirely in the browser using WebCodecs and FFmpeg WASM. No server required.

## Features

- Trim, crop, and resize video
- Brightness, contrast, saturation, rotation, and opacity adjustments
- Filter presets (Vivid, Warm, Cool, B&W, Fade, Dramatic, Film, Matte)
- Freehand annotations (pen and eraser)
- Text and sticker overlays
- Undo/redo with full history
- Zoom and pan preview
- Export to MP4 or WebM
- Drag-and-drop video import

## Installation

```bash
npm install kutlass
```

### Peer dependencies

```bash
npm install react react-dom framer-motion @ffmpeg/ffmpeg @ffmpeg/core @ffmpeg/util
```

## Quick start

```tsx
import { Kutlass, setFFmpegPaths } from "kutlass";
import "kutlass/styles.css";

// Point to where you serve the FFmpeg WASM files
setFFmpegPaths({
  coreJS: "/ffmpeg/ffmpeg-core.js",
  coreWasm: "/ffmpeg/ffmpeg-core.wasm",
});

function App() {
  return (
    <Kutlass
      style={{ width: 960, height: 640 }}
      onExportComplete={(blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "video.mp4";
        a.click();
      }}
    />
  );
}
```

## FFmpeg WASM setup

Kutlass uses FFmpeg compiled to WebAssembly for video encoding. You need to:

1. Copy the WASM files to your public directory:

```bash
cp node_modules/kutlass/public/ffmpeg/* public/ffmpeg/
```

2. Set the required cross-origin headers on your server. FFmpeg WASM requires `SharedArrayBuffer`, which needs these headers:

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Resource-Policy: cross-origin
```

**Next.js example** (`next.config.ts`):

```ts
const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
          { key: "Cross-Origin-Resource-Policy", value: "cross-origin" },
        ],
      },
    ];
  },
};
```

## Props

| Prop | Type | Description |
|---|---|---|
| `className` | `string` | CSS class for the outer container |
| `style` | `CSSProperties` | Inline styles for the outer container |
| `tools` | `Tool[]` | Which tools to show (`trim`, `crop`, `finetune`, `filter`, `annotate`, `sticker`, `resize`) |
| `exportSettings` | `Partial<ExportSettings>` | Default export settings (`format`, `resolution`, `fps`, `bitrate`) |
| `ffmpegPaths` | `Partial<FFmpegPaths>` | Override FFmpeg WASM file URLs |
| `onExportComplete` | `(blob: Blob) => void` | Called with the exported video blob when export finishes |

## API

### `setFFmpegPaths(paths)`

Configure where the FFmpeg WASM files are served from. Must be called before the first export.

```ts
import { setFFmpegPaths } from "kutlass";

setFFmpegPaths({
  coreJS: "/vendor/ffmpeg-core.js",
  coreWasm: "/vendor/ffmpeg-core.wasm",
});
```

## License

MIT
