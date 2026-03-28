# Kutlass — Agent Instructions

## Project overview

Kutlass is a fully client-side browser video editor shipped as an npm React component library (`kutlass`). All video processing runs in the browser — no server-side code exists in this project.

## Architecture

- **Entry point**: `src/index.ts` exports `<CutlassEditor />` and `setFFmpegPaths`
- **Editor shell**: `components/editor/Editor.tsx` — tool switching, export overlay, drag-and-drop
- **Preview**: `components/editor/preview/PreviewPanel.tsx` — canvas rendering, zoom, pan
- **Panels**: `components/editor/panels/` — TrimPanel, FinetunePanel, FilterPanel, CropPanel, ResizePanel, AnnotatePanel, StickerPanel
- **State**: Zustand store in `store/editorStore.ts`, slices in `store/slices/`
- **Video decoding**: `lib/webcodecs/VideoDecoder.ts` — WebCodecs via `<video>` element + `VideoFrame`
- **Frame rendering**: `lib/webcodecs/FrameRenderer.ts` — OffscreenCanvas 2D with CSS-equivalent filters
- **Export**: `lib/ffmpeg/exportPipeline.ts` — frame-by-frame canvas rendering → JPEG sequence → FFmpeg WASM encoding
- **FFmpeg**: `lib/ffmpeg/ffmpegClient.ts` — loads WASM from configurable paths (`src/ffmpegConfig.ts`)

## Key patterns

- **Zustand v5 without middleware** — use `useShallow` for array/object selectors
- **`usePlayback` hook** — RAF loop for live playback, subscription for paused renders, `trimScrub` for TrimPanel preview
- **`cropToolActive` flag** — when true, render full frame (for crop handle positioning); when false, render cropped result
- **History** — `store/slices/historySlice.ts` with `captureHistory()` called before mutations, `undo()`/`redo()` actions
- **Export cancellation** — `AbortController` at module level in `hooks/useExport.ts`, signal checked in frame loop

## Build

- `npm run build:lib` — tsup (ESM + CJS) + tsc (declarations) + Tailwind CLI (prebuilt CSS)
- `npm run dev` — Next.js demo app for local development
- `npm run build:app` — Next.js demo app production build

## Rules

<!-- BEGIN:nextjs-agent-rules -->
The demo app uses Next.js 16. This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any Next.js app code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

- The library source (`src/`, `components/`, `hooks/`, `lib/`, `store/`, `types/`) must remain framework-agnostic React. Do not introduce Next.js-specific APIs in library code.
- All components use `"use client"` — this is a client-only library.
- FFmpeg WASM paths are configurable via `setFFmpegPaths()` — never hardcode paths in library code.
- Consumers must set COOP/COEP/CORP headers for FFmpeg WASM to work.
- The Zustand store is a singleton — only one `<CutlassEditor />` instance per page is supported.
