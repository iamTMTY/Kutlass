"use client";
"use client";
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));

// src/KutlassEditor.tsx
import { useEffect as useEffect6 } from "react";

// components/editor/Editor.tsx
import { useState as useState3, useCallback as useCallback9 } from "react";
import { AnimatePresence, motion as motion3 } from "framer-motion";

// components/editor/TopBar.tsx
import { useRef } from "react";

// store/editorStore.ts
import { create } from "zustand";

// store/slices/timelineSlice.ts
import { nanoid } from "nanoid";
var DEFAULT_TRACKS = [
  { id: "track-video", type: "video", name: "Video", muted: false, locked: false },
  { id: "track-audio", type: "audio", name: "Audio", muted: false, locked: false },
  { id: "track-text", type: "text", name: "Text", muted: false, locked: false },
  { id: "track-effects", type: "effects", name: "Effects", muted: false, locked: false }
];
var createTimelineSlice = (set, get) => ({
  clips: [],
  tracks: DEFAULT_TRACKS,
  currentTime: 0,
  duration: 0,
  zoom: 80,
  selectedClipId: null,
  addClip: (clip) => set((state) => {
    const newClip = __spreadProps(__spreadValues({}, clip), { id: nanoid() });
    const newClips = [...state.clips, newClip];
    const duration = Math.max(...newClips.map((c) => c.startTime + c.duration), 0);
    return { clips: newClips, duration };
  }),
  removeClip: (id) => set((state) => {
    const newClips = state.clips.filter((c) => c.id !== id);
    const duration = newClips.length > 0 ? Math.max(...newClips.map((c) => c.startTime + c.duration)) : 0;
    return { clips: newClips, duration, selectedClipId: state.selectedClipId === id ? null : state.selectedClipId };
  }),
  updateClip: (id, updates) => set((state) => ({
    clips: state.clips.map((c) => c.id === id ? __spreadValues(__spreadValues({}, c), updates) : c)
  })),
  moveClip: (id, startTime) => set((state) => {
    const newClips = state.clips.map(
      (c) => c.id === id ? __spreadProps(__spreadValues({}, c), { startTime: Math.max(0, startTime) }) : c
    );
    const duration = Math.max(...newClips.map((c) => c.startTime + c.duration));
    return { clips: newClips, duration };
  }),
  trimClipStart: (id, newTrimIn, newStartTime, newDuration) => set((state) => {
    const newClips = state.clips.map(
      (c) => c.id === id ? __spreadProps(__spreadValues({}, c), { trimIn: newTrimIn, startTime: newStartTime, duration: newDuration }) : c
    );
    const clip = newClips.find((c) => c.id === id);
    const currentTime = clip ? Math.max(clip.startTime, Math.min(state.currentTime, clip.startTime + clip.duration)) : state.currentTime;
    return { clips: newClips, currentTime };
  }),
  trimClipEnd: (id, newTrimOut, newDuration) => set((state) => {
    const newClips = state.clips.map(
      (c) => c.id === id ? __spreadProps(__spreadValues({}, c), { trimOut: newTrimOut, duration: newDuration }) : c
    );
    const duration = Math.max(...newClips.map((c) => c.startTime + c.duration));
    const clip = newClips.find((c) => c.id === id);
    const currentTime = clip ? Math.max(clip.startTime, Math.min(state.currentTime, clip.startTime + clip.duration)) : state.currentTime;
    return { clips: newClips, duration, currentTime };
  }),
  splitClipAt: (id, time) => set((state) => {
    const clip = state.clips.find((c) => c.id === id);
    if (!clip) return {};
    const localTime = time - clip.startTime;
    if (localTime <= 0 || localTime >= clip.duration) return {};
    const firstHalf = __spreadProps(__spreadValues({}, clip), {
      duration: localTime,
      trimOut: clip.trimIn + localTime
    });
    const secondHalf = __spreadProps(__spreadValues({}, clip), {
      id: nanoid(),
      startTime: time,
      duration: clip.duration - localTime,
      trimIn: clip.trimIn + localTime
    });
    return {
      clips: state.clips.map((c) => c.id === id ? firstHalf : c).concat(secondHalf)
    };
  }),
  setCurrentTime: (time) => set((state) => ({ currentTime: Math.max(0, Math.min(time, state.duration)) })),
  setZoom: (zoom) => set(() => ({ zoom: Math.max(20, Math.min(300, zoom)) })),
  setSelectedClip: (id) => set(() => ({ selectedClipId: id })),
  recomputeDuration: () => set((state) => {
    const duration = state.clips.length > 0 ? Math.max(...state.clips.map((c) => c.startTime + c.duration)) : 0;
    return { duration };
  })
});

// store/slices/playbackSlice.ts
var createPlaybackSlice = (set) => ({
  isPlaying: false,
  fps: 30,
  playbackRate: 1,
  trimScrub: null,
  setPlaying: (playing) => set(() => ({ isPlaying: playing })),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setFps: (fps) => set(() => ({ fps })),
  setPlaybackRate: (rate) => set(() => ({ playbackRate: rate })),
  setTrimScrub: (scrub) => set(() => ({ trimScrub: scrub }))
});

// types/editor.ts
var DEFAULT_EFFECTS = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  rotation: 0,
  cropX: 0,
  cropY: 0,
  cropW: 1,
  cropH: 1,
  opacity: 1
};
var DEFAULT_EXPORT_SETTINGS = {
  format: "mp4",
  resolution: "720p",
  fps: 30,
  bitrate: 4e3
};

// store/slices/effectsSlice.ts
var createEffectsSlice = (set, get) => ({
  clipEffects: {},
  cropToolActive: false,
  setClipEffect: (clipId, key, value) => set((state) => {
    var _a;
    return {
      clipEffects: __spreadProps(__spreadValues({}, state.clipEffects), {
        [clipId]: __spreadProps(__spreadValues({}, (_a = state.clipEffects[clipId]) != null ? _a : DEFAULT_EFFECTS), {
          [key]: value
        })
      })
    };
  }),
  setClipEffects: (clipId, effects) => set((state) => {
    var _a;
    return {
      clipEffects: __spreadProps(__spreadValues({}, state.clipEffects), {
        [clipId]: __spreadValues(__spreadValues({}, (_a = state.clipEffects[clipId]) != null ? _a : DEFAULT_EFFECTS), effects)
      })
    };
  }),
  resetClipEffects: (clipId) => set((state) => {
    const next = __spreadValues({}, state.clipEffects);
    delete next[clipId];
    return { clipEffects: next };
  }),
  getClipEffects: (clipId) => {
    var _a;
    const state = get();
    return (_a = state.clipEffects[clipId]) != null ? _a : DEFAULT_EFFECTS;
  },
  setCropToolActive: (active) => set(() => ({ cropToolActive: active }))
});

// store/slices/exportSlice.ts
var createExportSlice = (set) => ({
  status: "idle",
  progress: 0,
  outputUrl: null,
  error: null,
  settings: DEFAULT_EXPORT_SETTINGS,
  setExportStatus: (status) => set(() => ({ status })),
  setExportProgress: (progress) => set(() => ({ progress })),
  setOutputUrl: (outputUrl) => set(() => ({ outputUrl })),
  setExportError: (error) => set(() => ({ error })),
  updateExportSettings: (settings) => set((state) => ({ settings: __spreadValues(__spreadValues({}, state.settings), settings) })),
  resetExport: () => set(() => ({ status: "idle", progress: 0, outputUrl: null, error: null }))
});

// store/slices/overlaysSlice.ts
import { nanoid as nanoid2 } from "nanoid";
var createOverlaysSlice = (set) => ({
  overlays: [],
  selectedOverlayId: null,
  addTextOverlay: (overlay) => {
    const id = nanoid2();
    set((state) => ({
      overlays: [...state.overlays, __spreadProps(__spreadValues({}, overlay), { id, type: "text" })],
      selectedOverlayId: id
    }));
    return id;
  },
  addStickerOverlay: (overlay) => {
    const id = nanoid2();
    set((state) => ({
      overlays: [...state.overlays, __spreadProps(__spreadValues({}, overlay), { id, type: "sticker" })],
      selectedOverlayId: id
    }));
    return id;
  },
  updateOverlay: (id, updates) => set((state) => ({
    overlays: state.overlays.map(
      (o) => o.id === id ? __spreadValues(__spreadValues({}, o), updates) : o
    )
  })),
  removeOverlay: (id) => set((state) => ({
    overlays: state.overlays.filter((o) => o.id !== id),
    selectedOverlayId: state.selectedOverlayId === id ? null : state.selectedOverlayId
  })),
  selectOverlay: (id) => set(() => ({ selectedOverlayId: id })),
  clearOverlays: () => set(() => ({ overlays: [], selectedOverlayId: null }))
});

// store/slices/drawingSlice.ts
function createDrawingSlice(set) {
  return {
    strokes: [],
    drawingTool: "pen",
    drawingColor: "#ff0000",
    drawingWidth: 4,
    addStroke: (stroke) => set((s) => ({ strokes: [...s.strokes, stroke] })),
    undoStroke: () => set((s) => ({ strokes: s.strokes.slice(0, -1) })),
    clearStrokes: () => set(() => ({ strokes: [] })),
    setDrawingTool: (tool) => set(() => ({ drawingTool: tool })),
    setDrawingColor: (color) => set(() => ({ drawingColor: color })),
    setDrawingWidth: (width) => set(() => ({ drawingWidth: width }))
  };
}

// store/slices/historySlice.ts
var createHistorySlice = (set, get) => ({
  past: [],
  future: [],
  captureHistory: () => {
    const s = get();
    const snapshot = {
      clips: s.clips,
      duration: s.duration,
      clipEffects: s.clipEffects,
      overlays: s.overlays
    };
    set(() => ({ past: [...s.past.slice(-49), snapshot], future: [] }));
  },
  undo: () => set((state) => {
    if (state.past.length === 0) return {};
    const entry = state.past[state.past.length - 1];
    const current = {
      clips: state.clips,
      duration: state.duration,
      clipEffects: state.clipEffects,
      overlays: state.overlays
    };
    return __spreadValues({
      past: state.past.slice(0, -1),
      future: [current, ...state.future]
    }, entry);
  }),
  redo: () => set((state) => {
    if (state.future.length === 0) return {};
    const entry = state.future[0];
    const current = {
      clips: state.clips,
      duration: state.duration,
      clipEffects: state.clipEffects,
      overlays: state.overlays
    };
    return __spreadValues({
      past: [...state.past, current],
      future: state.future.slice(1)
    }, entry);
  })
});

// store/editorStore.ts
var useEditorStore = create()((set, get) => __spreadValues(__spreadValues(__spreadValues(__spreadValues(__spreadValues(__spreadValues(__spreadValues({}, createTimelineSlice(set, get)), createPlaybackSlice(set)), createEffectsSlice(
  set,
  get
)), createExportSlice(set)), createOverlaysSlice(set)), createDrawingSlice(set)), createHistorySlice(
  set,
  get
)));

// hooks/useExport.ts
import { useCallback } from "react";

// lib/webcodecs/VideoDecoder.ts
var ClipVideoDecoder = class {
  constructor() {
    this.video = null;
    this.objectUrl = null;
    this.loadedFile = null;
    this.metadata = null;
    this._muted = false;
    this._audioBlocked = false;
    // Serialise seek operations so concurrent requestFrame calls don't race.
    this.seekChain = Promise.resolve();
    // Incrementing this number aborts all in-flight seeks (e.g. when playback starts).
    this.seekGeneration = 0;
  }
  async getMetadata(file) {
    if (this.metadata && this.loadedFile === file) return this.metadata;
    await this.ensureVideo(file);
    return this.metadata;
  }
  requestFrame(file, timeSeconds) {
    const gen = this.seekGeneration;
    const result = this.seekChain.then(async () => {
      if (this.seekGeneration !== gen) return null;
      await this.ensureVideo(file);
      if (this.seekGeneration !== gen) return null;
      return this.capture(timeSeconds);
    });
    this.seekChain = result.then(() => {
    }, () => {
    });
    return result;
  }
  /** Capture current frame without seeking — used during live playback. */
  captureCurrentFrame() {
    const video = this.video;
    if (!video) return null;
    return this.frameFromVideo(video, video.currentTime);
  }
  getVideoCurrentTime() {
    var _a, _b;
    return (_b = (_a = this.video) == null ? void 0 : _a.currentTime) != null ? _b : 0;
  }
  /** Start native video playback. Aborts any in-flight frame seeks first. */
  async startPlayback(fromTime) {
    const video = this.video;
    if (!video) return;
    this.seekGeneration++;
    this.seekChain = Promise.resolve();
    video.muted = this._muted;
    video.currentTime = fromTime;
    try {
      await video.play();
    } catch (e) {
      video.muted = true;
      try {
        await video.play();
        this._audioBlocked = true;
      } catch (e2) {
      }
    }
  }
  get audioBlocked() {
    return this._audioBlocked;
  }
  stopPlayback() {
    var _a;
    (_a = this.video) == null ? void 0 : _a.pause();
  }
  setMuted(muted) {
    this._muted = muted;
    if (this.video) this.video.muted = muted;
  }
  getMuted() {
    return this._muted;
  }
  ensureVideo(file) {
    if (this.video && this.loadedFile === file) return Promise.resolve();
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = null;
    }
    return new Promise((resolve, reject) => {
      this.objectUrl = URL.createObjectURL(file);
      const video = document.createElement("video");
      video.preload = "auto";
      video.playsInline = true;
      video.muted = true;
      video.src = this.objectUrl;
      const onMeta = () => {
        this.video = video;
        this.loadedFile = file;
        this.metadata = {
          duration: video.duration,
          width: video.videoWidth || 1280,
          height: video.videoHeight || 720,
          fps: 30,
          codec: "browser-native"
        };
        cleanup();
        resolve();
      };
      const onError = () => {
        cleanup();
        reject(new Error(`Failed to load video: ${file.name}`));
      };
      const cleanup = () => {
        video.removeEventListener("loadedmetadata", onMeta);
        video.removeEventListener("error", onError);
      };
      video.addEventListener("loadedmetadata", onMeta);
      video.addEventListener("error", onError);
    });
  }
  capture(timeSeconds) {
    const video = this.video;
    if (!video) return Promise.resolve(null);
    if (Math.abs(video.currentTime - timeSeconds) < 0.016) {
      return Promise.resolve(this.frameFromVideo(video, timeSeconds));
    }
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        video.removeEventListener("seeked", onSeeked);
        resolve(this.frameFromVideo(video, timeSeconds));
      }, 3e3);
      const onSeeked = () => {
        clearTimeout(timer);
        resolve(this.frameFromVideo(video, timeSeconds));
      };
      video.addEventListener("seeked", onSeeked, { once: true });
      video.currentTime = timeSeconds;
    });
  }
  frameFromVideo(video, timeSeconds) {
    try {
      return new VideoFrame(video, { timestamp: Math.round(timeSeconds * 1e6) });
    } catch (e) {
      return this.frameFromCanvas(video, timeSeconds);
    }
  }
  frameFromCanvas(video, timeSeconds) {
    try {
      const canvas = new OffscreenCanvas(video.videoWidth || 1280, video.videoHeight || 720);
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      ctx.drawImage(video, 0, 0);
      return new VideoFrame(canvas, { timestamp: Math.round(timeSeconds * 1e6) });
    } catch (e) {
      return null;
    }
  }
  dispose() {
    var _a;
    (_a = this.video) == null ? void 0 : _a.pause();
    this.video = null;
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = null;
    }
    this.metadata = null;
    this.loadedFile = null;
  }
};
var registry = /* @__PURE__ */ new Map();
function getDecoderForFile(file) {
  const key = `${file.name}::${file.size}::${file.lastModified}`;
  if (!registry.has(key)) registry.set(key, new ClipVideoDecoder());
  return registry.get(key);
}

// lib/webcodecs/FrameRenderer.ts
var FrameRenderer = class {
  renderFrame(frame, canvas, effects) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const srcX = effects.cropX * frame.displayWidth;
    const srcY = effects.cropY * frame.displayHeight;
    const srcW = effects.cropW * frame.displayWidth;
    const srcH = effects.cropH * frame.displayHeight;
    const w = Math.max(1, Math.round(srcW));
    const h = Math.max(1, Math.round(srcH));
    canvas.width = w;
    canvas.height = h;
    ctx.save();
    ctx.globalAlpha = effects.opacity;
    const filters = [];
    if (effects.brightness !== 0) filters.push(`brightness(${1 + effects.brightness / 100})`);
    if (effects.contrast !== 0) filters.push(`contrast(${1 + effects.contrast / 100})`);
    if (effects.saturation !== 0) filters.push(`saturate(${1 + effects.saturation / 100})`);
    ctx.filter = filters.length > 0 ? filters.join(" ") : "none";
    if (effects.rotation !== 0) {
      ctx.translate(w / 2, h / 2);
      ctx.rotate(effects.rotation * Math.PI / 180);
      ctx.translate(-w / 2, -h / 2);
    }
    ctx.drawImage(frame, srcX, srcY, srcW, srcH, 0, 0, w, h);
    ctx.restore();
  }
  clear(canvas) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
};

// src/ffmpegConfig.ts
var config = {
  coreJS: "/ffmpeg/ffmpeg-core.js",
  coreWasm: "/ffmpeg/ffmpeg-core.wasm"
};
function setFFmpegPaths(paths) {
  Object.assign(config, paths);
}
function getFFmpegPaths() {
  return config;
}

// lib/ffmpeg/ffmpegClient.ts
var ffmpegInstance = null;
var initPromise = null;
async function getFFmpeg() {
  if (ffmpegInstance) return ffmpegInstance;
  if (initPromise) return initPromise;
  initPromise = (async () => {
    const { FFmpeg } = await import("@ffmpeg/ffmpeg");
    const ffmpegUtil = await import("@ffmpeg/util");
    const toBlobURL = ffmpegUtil.toBlobURL;
    const ffmpeg = new FFmpeg();
    ffmpeg.on("log", ({ message }) => {
      console.log("[FFmpeg]", message);
    });
    const paths = getFFmpegPaths();
    await ffmpeg.load({
      coreURL: await toBlobURL(paths.coreJS, "text/javascript"),
      wasmURL: await toBlobURL(paths.coreWasm, "application/wasm")
    });
    ffmpegInstance = ffmpeg;
    return ffmpeg;
  })();
  return initPromise;
}

// lib/ffmpeg/exportPipeline.ts
function drawStrokes(ctx, strokes, w, h) {
  for (const stroke of strokes) {
    if (stroke.points.length < 2) continue;
    ctx.save();
    ctx.globalCompositeOperation = stroke.tool === "eraser" ? "destination-out" : "source-over";
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(stroke.points[0].x * w, stroke.points[0].y * h);
    for (let i = 1; i < stroke.points.length; i++) {
      ctx.lineTo(stroke.points[i].x * w, stroke.points[i].y * h);
    }
    ctx.stroke();
    ctx.restore();
  }
}
async function drawOverlays(ctx, overlays, w, h) {
  var _a;
  for (const overlay of overlays) {
    const px = overlay.x * w;
    const py = overlay.y * h;
    if (overlay.type === "text") {
      const o = overlay;
      const size = Math.round(o.fontSize / 720 * h);
      ctx.save();
      ctx.font = `${o.bold ? "bold " : ""}${size}px ${(_a = o.fontFamily) != null ? _a : "sans-serif"}`;
      ctx.fillStyle = o.color;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(o.text, px, py);
      ctx.restore();
    } else {
      const o = overlay;
      const baseSize = Math.round(80 * o.scale * (h / 720));
      if (o.imageUrl) {
        try {
          const resp = await fetch(o.imageUrl);
          const blob = await resp.blob();
          const bmp = await createImageBitmap(blob);
          ctx.save();
          ctx.drawImage(bmp, px - baseSize / 2, py - baseSize / 2, baseSize, baseSize);
          bmp.close();
          ctx.restore();
        } catch (e) {
        }
      } else if (o.emoji) {
        const size = Math.round(60 * o.scale * (h / 720));
        ctx.save();
        ctx.font = `${size}px serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(o.emoji, px, py);
        ctx.restore();
      }
    }
  }
}
function getOutputSize(clip, effects, resolution) {
  const cropW = Math.round(clip.width * effects.cropW);
  const cropH = Math.round(clip.height * effects.cropH);
  if (resolution === "original") return { w: cropW, h: cropH };
  const targets = {
    "1080p": { w: 1920, h: 1080 },
    "720p": { w: 1280, h: 720 },
    "480p": { w: 854, h: 480 }
  };
  const target = targets[resolution];
  if (!target) return { w: cropW, h: cropH };
  const aspect = cropW / cropH;
  let w = target.w;
  let h = Math.round(w / aspect);
  if (h > target.h) {
    h = target.h;
    w = Math.round(h * aspect);
  }
  return { w: w & ~1, h: h & ~1 };
}
async function runExport(job) {
  var _a, _b;
  const { clips, settings, effectsMap, strokes, overlays, onProgress, signal } = job;
  const ffmpeg = await getFFmpeg();
  const { fetchFile } = await import("@ffmpeg/util");
  const renderer2 = new FrameRenderer();
  const fps = settings.fps;
  const firstClip = clips[0];
  const firstEffects = (_a = effectsMap[firstClip.id]) != null ? _a : DEFAULT_EFFECTS;
  const { w: outW, h: outH } = getOutputSize(firstClip, firstEffects, settings.resolution);
  onProgress(2);
  let globalFrameIdx = 0;
  const totalFrames = clips.reduce((sum, c) => sum + Math.ceil(c.duration * fps), 0);
  for (const clip of clips) {
    const effects = (_b = effectsMap[clip.id]) != null ? _b : DEFAULT_EFFECTS;
    const decoder = getDecoderForFile(clip.file);
    const frameCount = Math.ceil(clip.duration * fps);
    for (let i = 0; i < frameCount; i++) {
      if (signal == null ? void 0 : signal.aborted) throw new DOMException("Export cancelled", "AbortError");
      const sourceTime = clip.trimIn + i / fps;
      const frame = await decoder.requestFrame(
        clip.file,
        Math.min(sourceTime, clip.trimOut - 1e-3)
      );
      const canvas = new OffscreenCanvas(outW, outH);
      if (frame) {
        const tmp = new OffscreenCanvas(1, 1);
        renderer2.renderFrame(frame, tmp, effects);
        frame.close();
        const ctx2 = canvas.getContext("2d");
        ctx2.drawImage(tmp, 0, 0, outW, outH);
      }
      const ctx = canvas.getContext("2d");
      if (strokes.length > 0) drawStrokes(ctx, strokes, outW, outH);
      if (overlays.length > 0) await drawOverlays(ctx, overlays, outW, outH);
      const blob = await canvas.convertToBlob({ type: "image/jpeg", quality: 0.92 });
      const frameName = `frame_${String(globalFrameIdx).padStart(6, "0")}.jpg`;
      await ffmpeg.writeFile(frameName, new Uint8Array(await blob.arrayBuffer()));
      globalFrameIdx++;
      onProgress(2 + Math.round(globalFrameIdx / totalFrames * 68));
    }
  }
  onProgress(70);
  const outputName = `output.${settings.format}`;
  const args = [
    "-framerate",
    String(fps),
    "-i",
    "frame_%06d.jpg",
    "-r",
    String(fps),
    "-b:v",
    `${settings.bitrate}k`,
    "-c:v",
    settings.format === "mp4" ? "libx264" : "libvpx-vp9"
  ];
  if (settings.format === "mp4") {
    args.push("-pix_fmt", "yuv420p");
    args.push("-preset", "fast");
    args.push("-movflags", "+faststart");
  }
  args.push("-y", outputName);
  const onFFmpegProgress = ({ progress }) => {
    onProgress(70 + Math.round(progress * 25));
  };
  ffmpeg.on("progress", onFFmpegProgress);
  try {
    await ffmpeg.exec(args);
  } finally {
    ffmpeg.off("progress", onFFmpegProgress);
  }
  onProgress(96);
  const data = await ffmpeg.readFile(outputName);
  const result = data instanceof Uint8Array ? data : new TextEncoder().encode(data);
  for (let i = 0; i < globalFrameIdx; i++) {
    const name = `frame_${String(i).padStart(6, "0")}.jpg`;
    await ffmpeg.deleteFile(name).catch(() => {
    });
  }
  await ffmpeg.deleteFile(outputName).catch(() => {
  });
  onProgress(100);
  return result;
}

// hooks/useExport.ts
var activeController = null;
function useExport() {
  const clips = useEditorStore((s) => s.clips);
  const settings = useEditorStore((s) => s.settings);
  const clipEffects = useEditorStore((s) => s.clipEffects);
  const strokes = useEditorStore((s) => s.strokes);
  const overlays = useEditorStore((s) => s.overlays);
  const setExportStatus = useEditorStore((s) => s.setExportStatus);
  const setExportProgress = useEditorStore((s) => s.setExportProgress);
  const setOutputUrl = useEditorStore((s) => s.setOutputUrl);
  const setExportError = useEditorStore((s) => s.setExportError);
  const resetExport = useEditorStore((s) => s.resetExport);
  const startExport = useCallback(async () => {
    const videoClips = clips.filter((c) => c.trackId === "track-video");
    if (videoClips.length === 0) return;
    activeController == null ? void 0 : activeController.abort();
    const controller = new AbortController();
    activeController = controller;
    resetExport();
    setExportStatus("preparing");
    try {
      const data = await runExport({
        clips: videoClips,
        settings,
        effectsMap: clipEffects,
        strokes,
        overlays,
        signal: controller.signal,
        onProgress: (p) => {
          if (controller.signal.aborted) return;
          setExportProgress(p);
          if (p > 10) setExportStatus("encoding");
        }
      });
      if (controller.signal.aborted) return;
      const mimeType = settings.format === "mp4" ? "video/mp4" : "video/webm";
      const blob = new Blob([data.buffer], { type: mimeType });
      const url = URL.createObjectURL(blob);
      setOutputUrl(url);
      setExportStatus("done");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }
      console.error("Export failed:", err);
      setExportError(err instanceof Error ? err.message : "Export failed");
      setExportStatus("error");
    }
  }, [clips, settings, clipEffects, strokes, overlays, resetExport, setExportStatus, setExportProgress, setOutputUrl, setExportError]);
  const cancelExport = useCallback(() => {
    activeController == null ? void 0 : activeController.abort();
    activeController = null;
    resetExport();
  }, [resetExport]);
  const downloadExport = useCallback(
    (url) => {
      const a = document.createElement("a");
      a.href = url;
      a.download = `kutlass-export.${settings.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    },
    [settings.format]
  );
  return { startExport, downloadExport, cancelExport };
}

// hooks/useVideoImport.ts
import { useCallback as useCallback2 } from "react";
var SUPPORTED_FORMATS = ["video/mp4", "video/webm", "video/quicktime", "video/x-matroska"];
function useVideoImport() {
  const addClip = useEditorStore((s) => s.addClip);
  const removeClip = useEditorStore((s) => s.removeClip);
  const setCurrentTime = useEditorStore((s) => s.setCurrentTime);
  const clearStrokes = useEditorStore((s) => s.clearStrokes);
  const clearOverlays = useEditorStore((s) => s.clearOverlays);
  const resetExport = useEditorStore((s) => s.resetExport);
  const importFile = useCallback2(async (file) => {
    if (!SUPPORTED_FORMATS.includes(file.type) && !file.name.match(/\.(mp4|webm|mov|mkv)$/i)) {
      console.warn("Unsupported file type:", file.type);
      return;
    }
    try {
      const decoder = getDecoderForFile(file);
      const metadata = await decoder.getMetadata(file);
      const initialThumbnails = [];
      try {
        const seekTo = Math.min(0.1, metadata.duration * 0.05);
        const frame = await decoder.requestFrame(file, seekTo);
        if (frame) {
          const thumbW = 320;
          const thumbH = Math.round(thumbW * (metadata.height / metadata.width));
          const canvas = document.createElement("canvas");
          canvas.width = thumbW;
          canvas.height = thumbH;
          const ctx = canvas.getContext("2d");
          if (ctx) ctx.drawImage(frame, 0, 0, thumbW, thumbH);
          frame.close();
          initialThumbnails.push(canvas.toDataURL("image/jpeg", 0.75));
        }
      } catch (e) {
      }
      const existingEnd = useEditorStore.getState().duration;
      const clip = {
        trackId: "track-video",
        name: file.name.replace(/\.[^.]+$/, ""),
        file,
        startTime: existingEnd,
        duration: metadata.duration,
        trimIn: 0,
        trimOut: metadata.duration,
        sourceDuration: metadata.duration,
        width: metadata.width,
        height: metadata.height,
        fps: metadata.fps,
        thumbnails: initialThumbnails
      };
      addClip(clip);
    } catch (err) {
      console.error("Failed to import video:", err);
    }
  }, [addClip]);
  const importFiles = useCallback2(
    (files) => {
      Array.from(files).forEach(importFile);
    },
    [importFile]
  );
  const replaceImport = useCallback2(
    (files) => {
      const { clips } = useEditorStore.getState();
      clips.forEach((c) => removeClip(c.id));
      setCurrentTime(0);
      clearStrokes();
      clearOverlays();
      resetExport();
      Array.from(files).forEach(importFile);
    },
    [importFile, removeClip, setCurrentTime, clearStrokes, clearOverlays, resetExport]
  );
  return { importFile, importFiles, replaceImport };
}

// components/editor/TopBar.tsx
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
function TopBar() {
  const zoom = useEditorStore((s) => s.zoom);
  const setZoom = useEditorStore((s) => s.setZoom);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const canUndo = useEditorStore((s) => s.past.length > 0);
  const canRedo = useEditorStore((s) => s.future.length > 0);
  const exportStatus = useEditorStore((s) => s.status);
  const clips = useEditorStore((s) => s.clips);
  const { startExport } = useExport();
  const { replaceImport } = useVideoImport();
  const fileInputRef = useRef(null);
  const isExporting = exportStatus === "preparing" || exportStatus === "encoding";
  const hasClips = clips.length > 0;
  const zoomPercent = Math.round(zoom / 80 * 100);
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center h-11 px-3 shrink-0 border-b border-white/[0.06]", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: undo,
          disabled: !canUndo,
          className: "w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed",
          title: "Undo (\u2318Z)",
          children: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", strokeWidth: 2, viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" }) })
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: redo,
          disabled: !canRedo,
          className: "w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed",
          title: "Redo (\u2318\u21E7Z)",
          children: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", strokeWidth: 2, viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" }) })
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 mx-auto", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setZoom(zoom / 1.25),
          className: "w-7 h-7 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors text-base leading-none",
          children: "-"
        }
      ),
      /* @__PURE__ */ jsxs("span", { className: "text-xs text-zinc-300 font-medium w-10 text-center tabular-nums", children: [
        zoomPercent,
        "%"
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setZoom(zoom * 1.25),
          className: "w-7 h-7 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors text-base leading-none",
          children: "+"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          ref: fileInputRef,
          type: "file",
          accept: "video/*",
          className: "hidden",
          onChange: (e) => {
            var _a;
            const files = Array.from((_a = e.target.files) != null ? _a : []).filter((f) => f.type.startsWith("video/"));
            if (files.length > 0) replaceImport(files);
            e.target.value = "";
          }
        }
      ),
      hasClips && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => {
              var _a;
              return (_a = fileInputRef.current) == null ? void 0 : _a.click();
            },
            className: "px-3 h-8 rounded-lg bg-white/7 hover:bg-white/12 text-zinc-300 text-sm font-medium transition-colors flex items-center gap-1.5",
            title: "Import new video",
            children: "Import Video"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            disabled: isExporting,
            onClick: startExport,
            className: "px-4 h-8 rounded-lg bg-amber-400 hover:bg-amber-300 text-zinc-900 text-sm font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed",
            children: "Done"
          }
        )
      ] })
    ] })
  ] });
}

// components/editor/Sidebar.tsx
import { motion } from "framer-motion";
import { jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
var TOOLS = [
  {
    id: "trim",
    label: "Trim",
    icon: /* @__PURE__ */ jsxs2("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", strokeWidth: 1.75, viewBox: "0 0 24 24", children: [
      /* @__PURE__ */ jsx2("rect", { x: "3", y: "5", width: "18", height: "14", rx: "1" }),
      /* @__PURE__ */ jsx2("path", { strokeLinecap: "round", d: "M3 9h18M3 15h18M9 5v14M15 5v14" })
    ] })
  },
  {
    id: "crop",
    label: "Crop",
    icon: /* @__PURE__ */ jsx2("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", strokeWidth: 1.75, viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx2("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M6 2v14a2 2 0 002 2h14M2 6h14a2 2 0 012 2v14" }) })
  },
  {
    id: "finetune",
    label: "Finetune",
    icon: /* @__PURE__ */ jsxs2("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", strokeWidth: 1.75, viewBox: "0 0 24 24", children: [
      /* @__PURE__ */ jsx2("path", { strokeLinecap: "round", d: "M4 6h16M4 12h16M4 18h16" }),
      /* @__PURE__ */ jsx2("circle", { cx: "9", cy: "6", r: "2", fill: "currentColor", stroke: "none" }),
      /* @__PURE__ */ jsx2("circle", { cx: "15", cy: "12", r: "2", fill: "currentColor", stroke: "none" }),
      /* @__PURE__ */ jsx2("circle", { cx: "9", cy: "18", r: "2", fill: "currentColor", stroke: "none" })
    ] })
  },
  {
    id: "filter",
    label: "Filter",
    icon: /* @__PURE__ */ jsxs2("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", strokeWidth: 1.75, viewBox: "0 0 24 24", children: [
      /* @__PURE__ */ jsx2("circle", { cx: "12", cy: "12", r: "9" }),
      /* @__PURE__ */ jsx2("path", { strokeLinecap: "round", d: "M12 3a9 9 0 010 18M3 12h18" })
    ] })
  },
  {
    id: "annotate",
    label: "Annotate",
    icon: /* @__PURE__ */ jsx2("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", strokeWidth: 1.75, viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx2("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M11 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-5M18.5 2.5a2.121 2.121 0 013 3L13 14l-4 1 1-4 8.5-8.5z" }) })
  },
  {
    id: "sticker",
    label: "Sticker",
    icon: /* @__PURE__ */ jsxs2("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", strokeWidth: 1.75, viewBox: "0 0 24 24", children: [
      /* @__PURE__ */ jsx2("circle", { cx: "12", cy: "12", r: "9" }),
      /* @__PURE__ */ jsx2("path", { strokeLinecap: "round", d: "M9 9h.01M15 9h.01M9 14s1 2 3 2 3-2 3-2" })
    ] })
  },
  {
    id: "resize",
    label: "Resize",
    icon: /* @__PURE__ */ jsx2("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", strokeWidth: 1.75, viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx2("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M4 8V5a1 1 0 011-1h3M16 4h3a1 1 0 011 1v3M20 16v3a1 1 0 01-1 1h-3M8 20H5a1 1 0 01-1-1v-3" }) })
  }
];
function Sidebar({ activeTool, onToolChange }) {
  return /* @__PURE__ */ jsx2("div", { className: "flex flex-col w-[72px] shrink-0 border-r border-white/[0.06] py-2 gap-1", children: TOOLS.map((tool) => {
    const isActive = activeTool === tool.id;
    return /* @__PURE__ */ jsxs2(
      "button",
      {
        onClick: () => onToolChange(tool.id),
        className: "relative flex flex-col items-center gap-1 py-2.5 mx-1.5 rounded-xl transition-colors",
        style: {
          color: isActive ? "white" : "rgb(161 161 170)",
          background: isActive ? "rgba(255,255,255,0.1)" : "transparent"
        },
        children: [
          isActive && /* @__PURE__ */ jsx2(
            motion.div,
            {
              layoutId: "sidebar-active",
              className: "absolute inset-0 rounded-xl bg-white/10",
              transition: { type: "spring", stiffness: 400, damping: 35 }
            }
          ),
          /* @__PURE__ */ jsx2("span", { className: "relative z-10", children: tool.icon }),
          /* @__PURE__ */ jsx2("span", { className: "relative z-10 text-[10px] font-medium leading-none", children: tool.label })
        ]
      },
      tool.id
    );
  }) });
}

// components/editor/preview/PreviewPanel.tsx
import { useRef as useRef6, useState, useEffect as useEffect3, useCallback as useCallback7 } from "react";
import { motion as motion2 } from "framer-motion";

// components/editor/preview/PreviewCanvas.tsx
import { forwardRef } from "react";
import { jsx as jsx3 } from "react/jsx-runtime";
var PreviewCanvas = forwardRef(
  function PreviewCanvas2(_props, ref) {
    return /* @__PURE__ */ jsx3(
      "canvas",
      {
        ref,
        className: "w-full h-full"
      }
    );
  }
);

// components/editor/preview/CropOverlay.tsx
import { useRef as useRef2, useCallback as useCallback3 } from "react";
import { jsx as jsx4, jsxs as jsxs3 } from "react/jsx-runtime";
function CropOverlay() {
  var _a, _b, _c;
  const selectedClipId = useEditorStore((s) => s.selectedClipId);
  const clips = useEditorStore((s) => s.clips);
  const clipEffects = useEditorStore((s) => s.clipEffects);
  const setClipEffects = useEditorStore((s) => s.setClipEffects);
  const captureHistory = useEditorStore((s) => s.captureHistory);
  const targetId = (_b = selectedClipId != null ? selectedClipId : (_a = clips.find((c) => c.trackId === "track-video")) == null ? void 0 : _a.id) != null ? _b : null;
  const effects = targetId ? (_c = clipEffects[targetId]) != null ? _c : DEFAULT_EFFECTS : DEFAULT_EFFECTS;
  const containerRef = useRef2(null);
  const dragRef = useRef2(null);
  const onPointerDown = useCallback3(
    (handle) => (e) => {
      if (!targetId) return;
      e.stopPropagation();
      captureHistory();
      e.currentTarget.setPointerCapture(e.pointerId);
      dragRef.current = {
        handle,
        startX: e.clientX,
        startY: e.clientY,
        startEffects: __spreadValues({}, effects)
      };
    },
    [targetId, effects, captureHistory]
  );
  const onPointerMove = useCallback3(
    (e) => {
      if (!dragRef.current || !containerRef.current || !targetId) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dx = (e.clientX - dragRef.current.startX) / rect.width;
      const dy = (e.clientY - dragRef.current.startY) / rect.height;
      const s = dragRef.current.startEffects;
      let { cropX: cropX2, cropY: cropY2, cropW: cropW2, cropH: cropH2 } = s;
      const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
      const MIN_SIZE = 0.05;
      switch (dragRef.current.handle) {
        case "move": {
          cropX2 = clamp(s.cropX + dx, 0, 1 - s.cropW);
          cropY2 = clamp(s.cropY + dy, 0, 1 - s.cropH);
          break;
        }
        case "nw": {
          const newX = clamp(s.cropX + dx, 0, s.cropX + s.cropW - MIN_SIZE);
          const newY = clamp(s.cropY + dy, 0, s.cropY + s.cropH - MIN_SIZE);
          cropW2 = s.cropW - (newX - s.cropX);
          cropH2 = s.cropH - (newY - s.cropY);
          cropX2 = newX;
          cropY2 = newY;
          break;
        }
        case "ne": {
          const newY = clamp(s.cropY + dy, 0, s.cropY + s.cropH - MIN_SIZE);
          cropW2 = clamp(s.cropW + dx, MIN_SIZE, 1 - s.cropX);
          cropH2 = s.cropH - (newY - s.cropY);
          cropY2 = newY;
          break;
        }
        case "sw": {
          const newX = clamp(s.cropX + dx, 0, s.cropX + s.cropW - MIN_SIZE);
          cropW2 = s.cropW - (newX - s.cropX);
          cropH2 = clamp(s.cropH + dy, MIN_SIZE, 1 - s.cropY);
          cropX2 = newX;
          break;
        }
        case "se": {
          cropW2 = clamp(s.cropW + dx, MIN_SIZE, 1 - s.cropX);
          cropH2 = clamp(s.cropH + dy, MIN_SIZE, 1 - s.cropY);
          break;
        }
        case "n": {
          const newY = clamp(s.cropY + dy, 0, s.cropY + s.cropH - MIN_SIZE);
          cropH2 = s.cropH - (newY - s.cropY);
          cropY2 = newY;
          break;
        }
        case "s": {
          cropH2 = clamp(s.cropH + dy, MIN_SIZE, 1 - s.cropY);
          break;
        }
        case "w": {
          const newX = clamp(s.cropX + dx, 0, s.cropX + s.cropW - MIN_SIZE);
          cropW2 = s.cropW - (newX - s.cropX);
          cropX2 = newX;
          break;
        }
        case "e": {
          cropW2 = clamp(s.cropW + dx, MIN_SIZE, 1 - s.cropX);
          break;
        }
      }
      setClipEffects(targetId, { cropX: cropX2, cropY: cropY2, cropW: cropW2, cropH: cropH2 });
    },
    [targetId, setClipEffects]
  );
  const onPointerUp = useCallback3(() => {
    dragRef.current = null;
  }, []);
  const { cropX, cropY, cropW, cropH } = effects;
  const x = cropX * 100;
  const y = cropY * 100;
  const w = cropW * 100;
  const h = cropH * 100;
  const handleStyle = (cursor) => ({
    position: "absolute",
    width: 12,
    height: 12,
    background: "white",
    border: "2px solid rgba(251,191,36,0.9)",
    borderRadius: 2,
    cursor,
    transform: "translate(-50%, -50%)",
    zIndex: 30
  });
  const EDGE_HIT = 16;
  const edgeStyle = (cursor, extra) => __spreadValues({
    position: "absolute",
    background: "transparent",
    cursor,
    zIndex: 30
  }, extra);
  return /* @__PURE__ */ jsxs3(
    "div",
    {
      ref: containerRef,
      className: "absolute inset-0",
      onPointerMove,
      onPointerUp,
      style: { zIndex: 20 },
      children: [
        /* @__PURE__ */ jsx4("div", { className: "absolute pointer-events-none", style: { top: 0, left: 0, right: 0, height: `${y}%`, background: "rgba(0,0,0,0.55)" } }),
        /* @__PURE__ */ jsx4("div", { className: "absolute pointer-events-none", style: { bottom: 0, left: 0, right: 0, height: `${100 - y - h}%`, background: "rgba(0,0,0,0.55)" } }),
        /* @__PURE__ */ jsx4("div", { className: "absolute pointer-events-none", style: { top: `${y}%`, left: 0, width: `${x}%`, height: `${h}%`, background: "rgba(0,0,0,0.55)" } }),
        /* @__PURE__ */ jsx4("div", { className: "absolute pointer-events-none", style: { top: `${y}%`, right: 0, width: `${100 - x - w}%`, height: `${h}%`, background: "rgba(0,0,0,0.55)" } }),
        /* @__PURE__ */ jsx4(
          "div",
          {
            className: "absolute",
            style: {
              left: `${x}%`,
              top: `${y}%`,
              width: `${w}%`,
              height: `${h}%`,
              border: "2px solid rgba(251,191,36,0.9)",
              boxSizing: "border-box",
              cursor: "move",
              zIndex: 22
            },
            onPointerDown: onPointerDown("move"),
            children: /* @__PURE__ */ jsxs3("div", { className: "absolute inset-0 pointer-events-none", style: { opacity: 0.3 }, children: [
              /* @__PURE__ */ jsx4("div", { className: "absolute bg-white/50", style: { left: "33.3%", top: 0, bottom: 0, width: 1 } }),
              /* @__PURE__ */ jsx4("div", { className: "absolute bg-white/50", style: { left: "66.6%", top: 0, bottom: 0, width: 1 } }),
              /* @__PURE__ */ jsx4("div", { className: "absolute bg-white/50", style: { top: "33.3%", left: 0, right: 0, height: 1 } }),
              /* @__PURE__ */ jsx4("div", { className: "absolute bg-white/50", style: { top: "66.6%", left: 0, right: 0, height: 1 } })
            ] })
          }
        ),
        /* @__PURE__ */ jsx4("div", { style: __spreadProps(__spreadValues({}, handleStyle("nw-resize")), { left: `${x}%`, top: `${y}%` }), onPointerDown: onPointerDown("nw") }),
        /* @__PURE__ */ jsx4("div", { style: __spreadProps(__spreadValues({}, handleStyle("ne-resize")), { left: `${x + w}%`, top: `${y}%` }), onPointerDown: onPointerDown("ne") }),
        /* @__PURE__ */ jsx4("div", { style: __spreadProps(__spreadValues({}, handleStyle("sw-resize")), { left: `${x}%`, top: `${y + h}%` }), onPointerDown: onPointerDown("sw") }),
        /* @__PURE__ */ jsx4("div", { style: __spreadProps(__spreadValues({}, handleStyle("se-resize")), { left: `${x + w}%`, top: `${y + h}%` }), onPointerDown: onPointerDown("se") }),
        /* @__PURE__ */ jsx4(
          "div",
          {
            style: edgeStyle("n-resize", { left: `${x}%`, top: `calc(${y}% - ${EDGE_HIT / 2}px)`, width: `${w}%`, height: EDGE_HIT }),
            onPointerDown: onPointerDown("n")
          }
        ),
        /* @__PURE__ */ jsx4(
          "div",
          {
            style: edgeStyle("s-resize", { left: `${x}%`, top: `calc(${y + h}% - ${EDGE_HIT / 2}px)`, width: `${w}%`, height: EDGE_HIT }),
            onPointerDown: onPointerDown("s")
          }
        ),
        /* @__PURE__ */ jsx4(
          "div",
          {
            style: edgeStyle("w-resize", { left: `calc(${x}% - ${EDGE_HIT / 2}px)`, top: `${y}%`, width: EDGE_HIT, height: `${h}%` }),
            onPointerDown: onPointerDown("w")
          }
        ),
        /* @__PURE__ */ jsx4(
          "div",
          {
            style: edgeStyle("e-resize", { left: `calc(${x + w}% - ${EDGE_HIT / 2}px)`, top: `${y}%`, width: EDGE_HIT, height: `${h}%` }),
            onPointerDown: onPointerDown("e")
          }
        )
      ]
    }
  );
}

// components/editor/preview/OverlayLayer.tsx
import { useRef as useRef3, useCallback as useCallback4 } from "react";
import { jsx as jsx5, jsxs as jsxs4 } from "react/jsx-runtime";
function OverlayLayer() {
  const overlays = useEditorStore((s) => s.overlays);
  const selectedOverlayId = useEditorStore((s) => s.selectedOverlayId);
  const selectOverlay = useEditorStore((s) => s.selectOverlay);
  const updateOverlay = useEditorStore((s) => s.updateOverlay);
  const removeOverlay = useEditorStore((s) => s.removeOverlay);
  const containerRef = useRef3(null);
  const dragRef = useRef3(null);
  const onPointerDown = useCallback4(
    (overlay) => (e) => {
      e.stopPropagation();
      selectOverlay(overlay.id);
      e.currentTarget.setPointerCapture(e.pointerId);
      dragRef.current = {
        id: overlay.id,
        startX: e.clientX,
        startY: e.clientY,
        startOX: overlay.x,
        startOY: overlay.y
      };
    },
    [selectOverlay]
  );
  const onPointerMove = useCallback4(
    (e) => {
      if (!dragRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dx = (e.clientX - dragRef.current.startX) / rect.width;
      const dy = (e.clientY - dragRef.current.startY) / rect.height;
      const x = Math.max(0, Math.min(1, dragRef.current.startOX + dx));
      const y = Math.max(0, Math.min(1, dragRef.current.startOY + dy));
      updateOverlay(dragRef.current.id, { x, y });
    },
    [updateOverlay]
  );
  const onPointerUp = useCallback4(() => {
    dragRef.current = null;
  }, []);
  if (overlays.length === 0) return null;
  return /* @__PURE__ */ jsx5(
    "div",
    {
      ref: containerRef,
      className: "absolute inset-0 pointer-events-none",
      style: { zIndex: 15 },
      onPointerMove,
      onPointerUp,
      children: overlays.map((overlay) => {
        const isSelected = selectedOverlayId === overlay.id;
        if (overlay.type === "text") {
          const o = overlay;
          return /* @__PURE__ */ jsxs4(
            "div",
            {
              className: "absolute pointer-events-auto select-none",
              style: {
                left: `${o.x * 100}%`,
                top: `${o.y * 100}%`,
                transform: "translate(-50%, -50%)",
                cursor: "move",
                outline: isSelected ? "2px solid rgba(251,191,36,0.8)" : "none",
                outlineOffset: 4,
                borderRadius: 2,
                padding: "2px 4px"
              },
              onPointerDown: onPointerDown(o),
              children: [
                /* @__PURE__ */ jsx5(
                  "span",
                  {
                    style: {
                      fontFamily: o.fontFamily,
                      fontSize: o.fontSize,
                      color: o.color,
                      fontWeight: o.bold ? "bold" : "normal",
                      textShadow: "0 1px 4px rgba(0,0,0,0.7)",
                      whiteSpace: "nowrap",
                      display: "block"
                    },
                    children: o.text
                  }
                ),
                isSelected && /* @__PURE__ */ jsx5(
                  "button",
                  {
                    className: "absolute -top-2.5 -right-2.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center",
                    style: { fontSize: 10, pointerEvents: "auto" },
                    onPointerDown: (e) => e.stopPropagation(),
                    onClick: () => removeOverlay(o.id),
                    children: "\xD7"
                  }
                )
              ]
            },
            o.id
          );
        }
        if (overlay.type === "sticker") {
          const o = overlay;
          const emojiSize = 48 * o.scale;
          const imgSize = 80 * o.scale;
          return /* @__PURE__ */ jsxs4(
            "div",
            {
              className: "absolute pointer-events-auto select-none",
              style: {
                left: `${o.x * 100}%`,
                top: `${o.y * 100}%`,
                transform: "translate(-50%, -50%)",
                cursor: "move",
                outline: isSelected ? "2px solid rgba(251,191,36,0.8)" : "none",
                outlineOffset: 4,
                borderRadius: 4,
                lineHeight: 1
              },
              onPointerDown: onPointerDown(o),
              children: [
                o.imageUrl ? /* @__PURE__ */ jsx5(
                  "img",
                  {
                    src: o.imageUrl,
                    alt: "",
                    style: {
                      width: imgSize,
                      height: imgSize,
                      objectFit: "contain",
                      display: "block",
                      filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.4))",
                      pointerEvents: "none"
                    },
                    draggable: false
                  }
                ) : /* @__PURE__ */ jsx5(
                  "span",
                  {
                    style: {
                      fontSize: emojiSize,
                      display: "block",
                      filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.4))"
                    },
                    children: o.emoji
                  }
                ),
                isSelected && /* @__PURE__ */ jsx5(
                  "button",
                  {
                    className: "absolute -top-2.5 -right-2.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center",
                    style: { fontSize: 10, pointerEvents: "auto" },
                    onPointerDown: (e) => e.stopPropagation(),
                    onClick: () => removeOverlay(o.id),
                    children: "\xD7"
                  }
                )
              ]
            },
            o.id
          );
        }
        return null;
      })
    }
  );
}

// components/editor/preview/DrawingCanvas.tsx
import { useRef as useRef4, useEffect, useCallback as useCallback5 } from "react";
import { jsx as jsx6 } from "react/jsx-runtime";
function renderStrokes(ctx, strokes, w, h) {
  ctx.clearRect(0, 0, w, h);
  for (const stroke of strokes) {
    if (stroke.points.length < 2) continue;
    ctx.save();
    if (stroke.tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0,0,0,1)";
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = stroke.color;
    }
    ctx.lineWidth = stroke.width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(stroke.points[0].x * w, stroke.points[0].y * h);
    for (let i = 1; i < stroke.points.length; i++) {
      ctx.lineTo(stroke.points[i].x * w, stroke.points[i].y * h);
    }
    ctx.stroke();
    ctx.restore();
  }
}
function DrawingCanvas({ isActive }) {
  const canvasRef = useRef4(null);
  const activeStrokeRef = useRef4([]);
  const isDrawingRef = useRef4(false);
  const strokes = useEditorStore((s) => s.strokes);
  const drawingTool = useEditorStore((s) => s.drawingTool);
  const drawingColor = useEditorStore((s) => s.drawingColor);
  const drawingWidth = useEditorStore((s) => s.drawingWidth);
  const addStroke = useEditorStore((s) => s.addStroke);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    renderStrokes(ctx, strokes, canvas.width, canvas.height);
  }, [strokes]);
  const getRelative = useCallback5((e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height
    };
  }, []);
  const onPointerDown = useCallback5(
    (e) => {
      if (!isActive) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      isDrawingRef.current = true;
      const pt = getRelative(e);
      activeStrokeRef.current = [pt];
    },
    [isActive, getRelative]
  );
  const onPointerMove = useCallback5(
    (e) => {
      if (!isDrawingRef.current || !isActive) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const pt = getRelative(e);
      activeStrokeRef.current.push(pt);
      renderStrokes(ctx, strokes, canvas.width, canvas.height);
      const pts = activeStrokeRef.current;
      if (pts.length < 2) return;
      ctx.save();
      if (drawingTool === "eraser") {
        ctx.globalCompositeOperation = "destination-out";
        ctx.strokeStyle = "rgba(0,0,0,1)";
      } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = drawingColor;
      }
      ctx.lineWidth = drawingWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(pts[0].x * canvas.width, pts[0].y * canvas.height);
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i].x * canvas.width, pts[i].y * canvas.height);
      }
      ctx.stroke();
      ctx.restore();
    },
    [isActive, strokes, drawingTool, drawingColor, drawingWidth, getRelative]
  );
  const onPointerUp = useCallback5(() => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    const pts = activeStrokeRef.current;
    if (pts.length >= 2) {
      addStroke({
        id: crypto.randomUUID(),
        tool: drawingTool,
        color: drawingColor,
        width: drawingWidth,
        points: pts
      });
    }
    activeStrokeRef.current = [];
  }, [addStroke, drawingTool, drawingColor, drawingWidth]);
  return /* @__PURE__ */ jsx6(
    "canvas",
    {
      ref: canvasRef,
      width: 1280,
      height: 720,
      className: "absolute inset-0 w-full h-full",
      style: {
        zIndex: 18,
        cursor: isActive ? drawingTool === "eraser" ? "cell" : "crosshair" : "none",
        pointerEvents: isActive ? "auto" : "none"
      },
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerLeave: onPointerUp
    }
  );
}

// hooks/usePlayback.ts
import { useEffect as useEffect2, useRef as useRef5, useCallback as useCallback6 } from "react";

// lib/webcodecs/PreviewEngine.ts
var renderer = new FrameRenderer();
async function renderPreview(canvas, clips, currentTime, effectsMap, skipCrop = false) {
  var _a;
  const activeClip = clips.find(
    (c) => c.trackId === "track-video" && c.startTime <= currentTime && c.startTime + c.duration > currentTime
  );
  if (!activeClip) {
    renderer.clear(canvas);
    return;
  }
  const localTime = currentTime - activeClip.startTime + activeClip.trimIn;
  const decoder = getDecoderForFile(activeClip.file);
  const frame = await decoder.requestFrame(activeClip.file, localTime);
  if (!frame) return;
  const base = (_a = effectsMap[activeClip.id]) != null ? _a : DEFAULT_EFFECTS;
  const effects = skipCrop ? __spreadProps(__spreadValues({}, base), { cropX: 0, cropY: 0, cropW: 1, cropH: 1 }) : base;
  renderer.renderFrame(frame, canvas, effects);
  frame.close();
}

// hooks/usePlayback.ts
function getActiveClipNow(time) {
  const { clips } = useEditorStore.getState();
  const clip = clips.find(
    (c) => c.trackId === "track-video" && c.startTime <= time && c.startTime + c.duration > time
  );
  return clip ? { clip, decoder: getDecoderForFile(clip.file) } : null;
}
function usePlayback(canvasRef, onFirstFrame) {
  const isPlaying = useEditorStore((s) => s.isPlaying);
  const clipsLength = useEditorStore((s) => s.clips.filter((c) => c.trackId === "track-video").length);
  const rafRef = useRef5(null);
  const renderingRef = useRef5(false);
  const firstFrameFiredRef = useRef5(false);
  useEffect2(() => {
    if (clipsLength === 0) firstFrameFiredRef.current = false;
  }, [clipsLength]);
  const renderFrame = useCallback6(
    async (time) => {
      if (!canvasRef.current || renderingRef.current) return;
      renderingRef.current = true;
      try {
        const { clips, clipEffects, cropToolActive } = useEditorStore.getState();
        await renderPreview(canvasRef.current, clips, time, clipEffects, cropToolActive);
        if (!firstFrameFiredRef.current) {
          firstFrameFiredRef.current = true;
          onFirstFrame == null ? void 0 : onFirstFrame();
        }
      } finally {
        renderingRef.current = false;
      }
    },
    [canvasRef, onFirstFrame]
  );
  const renderSourceFrame = useCallback6(
    async (clipId, sourceTime) => {
      var _a;
      if (!canvasRef.current || renderingRef.current) return;
      renderingRef.current = true;
      try {
        const { clips, clipEffects } = useEditorStore.getState();
        const clip = clips.find((c) => c.id === clipId);
        if (!clip) return;
        const decoder = getDecoderForFile(clip.file);
        const frame = await decoder.requestFrame(clip.file, sourceTime);
        if (!frame) return;
        const effects = (_a = clipEffects[clip.id]) != null ? _a : DEFAULT_EFFECTS;
        renderer.renderFrame(frame, canvasRef.current, effects);
        frame.close();
      } finally {
        renderingRef.current = false;
      }
    },
    [canvasRef]
  );
  const renderFrameRef = useRef5(renderFrame);
  renderFrameRef.current = renderFrame;
  const renderSourceFrameRef = useRef5(renderSourceFrame);
  renderSourceFrameRef.current = renderSourceFrame;
  useEffect2(() => {
    let lastTime = useEditorStore.getState().currentTime;
    let lastEffects = useEditorStore.getState().clipEffects;
    let lastTrimScrub = useEditorStore.getState().trimScrub;
    let lastCropToolActive = useEditorStore.getState().cropToolActive;
    return useEditorStore.subscribe((state) => {
      if (state.isPlaying) return;
      const scrubChanged = state.trimScrub !== lastTrimScrub;
      if (scrubChanged) {
        lastTrimScrub = state.trimScrub;
        if (state.trimScrub) {
          renderSourceFrameRef.current(state.trimScrub.clipId, state.trimScrub.sourceTime);
          return;
        }
      }
      if (state.trimScrub) return;
      const timeChanged = state.currentTime !== lastTime;
      const effectsChanged = state.clipEffects !== lastEffects;
      const cropChanged = state.cropToolActive !== lastCropToolActive;
      if (timeChanged || effectsChanged || cropChanged) {
        lastTime = state.currentTime;
        lastEffects = state.clipEffects;
        lastCropToolActive = state.cropToolActive;
        renderFrameRef.current(state.currentTime);
      }
    });
  }, []);
  useEffect2(() => {
    if (clipsLength === 0) return;
    const timer = setTimeout(() => {
      renderFrameRef.current(useEditorStore.getState().currentTime);
    }, 100);
    return () => clearTimeout(timer);
  }, [clipsLength]);
  useEffect2(() => {
    if (!isPlaying) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }
    const loop = () => {
      var _a;
      const { duration } = useEditorStore.getState();
      const currentTime = useEditorStore.getState().currentTime;
      const active = getActiveClipNow(currentTime);
      if (active) {
        const videoTime = active.decoder.getVideoCurrentTime();
        const timelineTime = active.clip.startTime + videoTime - active.clip.trimIn;
        if (timelineTime >= duration) {
          useEditorStore.getState().setPlaying(false);
          active.decoder.stopPlayback();
          useEditorStore.getState().setCurrentTime(0);
          return;
        }
        useEditorStore.getState().setCurrentTime(Math.min(timelineTime, duration));
        if (canvasRef.current && !renderingRef.current) {
          const frame = active.decoder.captureCurrentFrame();
          if (frame) {
            const { clipEffects, cropToolActive } = useEditorStore.getState();
            const base = (_a = clipEffects[active.clip.id]) != null ? _a : DEFAULT_EFFECTS;
            const effects = cropToolActive ? __spreadProps(__spreadValues({}, base), { cropX: 0, cropY: 0, cropW: 1, cropH: 1 }) : base;
            renderer.renderFrame(frame, canvasRef.current, effects);
            frame.close();
          }
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isPlaying, canvasRef]);
}

// lib/playbackActions.ts
function getActiveVideoClip(time) {
  var _a;
  const clips = useEditorStore.getState().clips;
  return (_a = clips.find(
    (c) => c.trackId === "track-video" && c.startTime <= time && c.startTime + c.duration > time
  )) != null ? _a : null;
}
function playAction() {
  const { currentTime, setPlaying } = useEditorStore.getState();
  const clip = getActiveVideoClip(currentTime);
  if (clip) {
    const localTime = currentTime - clip.startTime + clip.trimIn;
    getDecoderForFile(clip.file).startPlayback(localTime);
  }
  setPlaying(true);
}
function pauseAction() {
  const { currentTime, setPlaying } = useEditorStore.getState();
  const clip = getActiveVideoClip(currentTime);
  if (clip) {
    getDecoderForFile(clip.file).stopPlayback();
  }
  setPlaying(false);
}
function togglePlayAction() {
  const { isPlaying } = useEditorStore.getState();
  if (isPlaying) pauseAction();
  else playAction();
}

// components/editor/preview/PreviewPanel.tsx
import { useShallow } from "zustand/react/shallow";
import { Fragment as Fragment2, jsx as jsx7, jsxs as jsxs5 } from "react/jsx-runtime";
function PreviewPanel({ activeTool }) {
  var _a;
  const canvasRef = useRef6(null);
  const fileInputRef = useRef6(null);
  const [isMuted, setIsMuted] = useState(false);
  const [audioBlocked, setAudioBlocked] = useState(false);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isPanning, setIsPanning] = useState(false);
  const panDragRef = useRef6(null);
  const [previewReady, setPreviewReady] = useState(false);
  const isPlaying = useEditorStore((s) => s.isPlaying);
  const duration = useEditorStore((s) => s.duration);
  const currentTime = useEditorStore((s) => s.currentTime);
  const clips = useEditorStore(useShallow((s) => s.clips.filter((c) => c.trackId === "track-video")));
  const clipEffects = useEditorStore((s) => s.clipEffects);
  const cropToolActive = useEditorStore((s) => s.cropToolActive);
  const storeZoom = useEditorStore((s) => s.zoom);
  const previewScale = storeZoom / 80;
  const { importFiles } = useVideoImport();
  usePlayback(canvasRef, useCallback7(() => setPreviewReady(true), []));
  useEffect3(() => {
    if (previewScale <= 1) {
      setPanX(0);
      setPanY(0);
    }
  }, [previewScale]);
  useEffect3(() => {
    if (clips.length === 0) setPreviewReady(false);
  }, [clips.length]);
  const handlePanDown = useCallback7((e) => {
    if (previewScale <= 1) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsPanning(true);
    panDragRef.current = { startX: e.clientX, startY: e.clientY, startPanX: panX, startPanY: panY };
  }, [previewScale, panX, panY]);
  const handlePanMove = useCallback7((e) => {
    if (!panDragRef.current) return;
    setPanX(panDragRef.current.startPanX + (e.clientX - panDragRef.current.startX));
    setPanY(panDragRef.current.startPanY + (e.clientY - panDragRef.current.startY));
  }, []);
  const handlePanUp = useCallback7(() => {
    panDragRef.current = null;
    setIsPanning(false);
  }, []);
  const activeClip = (_a = clips.find(
    (c) => c.startTime <= currentTime && c.startTime + c.duration > currentTime
  )) != null ? _a : clips[0];
  const aspectRatio = (() => {
    var _a2, _b;
    if (!activeClip) return "16/9";
    if (cropToolActive) return `${activeClip.width}/${activeClip.height}`;
    const effects = clipEffects[activeClip.id];
    const cropW = (_a2 = effects == null ? void 0 : effects.cropW) != null ? _a2 : 1;
    const cropH = (_b = effects == null ? void 0 : effects.cropH) != null ? _b : 1;
    return `${cropW * activeClip.width}/${cropH * activeClip.height}`;
  })();
  useEffect3(() => {
    if (!activeClip) return;
    const decoder = getDecoderForFile(activeClip.file);
    decoder.setMuted(isMuted);
  }, [isMuted, activeClip]);
  useEffect3(() => {
    if (!isPlaying || !activeClip) return;
    const timer = setTimeout(() => {
      const decoder = getDecoderForFile(activeClip.file);
      setAudioBlocked(decoder.audioBlocked);
    }, 300);
    return () => clearTimeout(timer);
  }, [isPlaying, activeClip]);
  const handleMuteToggle = () => {
    setIsMuted((m) => !m);
    if (audioBlocked && isMuted) setAudioBlocked(false);
  };
  const hasClips = clips.length > 0;
  return /* @__PURE__ */ jsx7(
    "div",
    {
      className: "relative flex-1 flex items-center justify-center bg-black overflow-hidden min-h-0",
      style: { cursor: previewScale > 1 ? isPanning ? "grabbing" : "grab" : "default" },
      onPointerDown: handlePanDown,
      onPointerMove: handlePanMove,
      onPointerUp: handlePanUp,
      children: hasClips ? /* @__PURE__ */ jsxs5(Fragment2, { children: [
        /* @__PURE__ */ jsxs5(
          "div",
          {
            className: "relative max-w-full max-h-full",
            style: { aspectRatio, display: "flex", transform: `translate(${panX}px, ${panY}px) scale(${previewScale})`, transformOrigin: "center center" },
            children: [
              /* @__PURE__ */ jsx7(PreviewCanvas, { ref: canvasRef }),
              !previewReady && /* @__PURE__ */ jsx7("div", { className: "absolute inset-0 flex items-center justify-center bg-black z-10", children: /* @__PURE__ */ jsx7("div", { className: "w-8 h-8 border-2 border-zinc-600 border-t-zinc-300 rounded-full animate-spin" }) }),
              /* @__PURE__ */ jsx7(OverlayLayer, {}),
              /* @__PURE__ */ jsx7(DrawingCanvas, { isActive: activeTool === "annotate" }),
              activeTool === "crop" && /* @__PURE__ */ jsx7(CropOverlay, {})
            ]
          }
        ),
        audioBlocked && !isMuted && /* @__PURE__ */ jsxs5(
          motion2.div,
          {
            initial: { opacity: 0, y: -4 },
            animate: { opacity: 1, y: 0 },
            className: "absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800/90 backdrop-blur-sm border border-white/10 text-xs text-zinc-300",
            children: [
              /* @__PURE__ */ jsx7("svg", { className: "w-3.5 h-3.5 text-amber-400 shrink-0", fill: "currentColor", viewBox: "0 0 20 20", children: /* @__PURE__ */ jsx7("path", { fillRule: "evenodd", d: "M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z", clipRule: "evenodd" }) }),
              "Audio blocked by browser \u2014 open in Chrome for sound"
            ]
          }
        ),
        /* @__PURE__ */ jsxs5("div", { className: "absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2", children: [
          /* @__PURE__ */ jsx7(
            motion2.button,
            {
              whileTap: { scale: 0.92 },
              onClick: togglePlayAction,
              disabled: duration === 0,
              className: "w-10 h-10 rounded-full bg-white/90 hover:bg-white text-zinc-900 flex items-center justify-center shadow-lg transition-colors",
              children: isPlaying ? /* @__PURE__ */ jsx7("svg", { className: "w-4 h-4", fill: "currentColor", viewBox: "0 0 20 20", children: /* @__PURE__ */ jsx7("path", { fillRule: "evenodd", d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z", clipRule: "evenodd" }) }) : /* @__PURE__ */ jsx7("svg", { className: "w-4 h-4 translate-x-0.5", fill: "currentColor", viewBox: "0 0 20 20", children: /* @__PURE__ */ jsx7("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z", clipRule: "evenodd" }) })
            }
          ),
          /* @__PURE__ */ jsx7(
            motion2.button,
            {
              whileTap: { scale: 0.92 },
              onClick: handleMuteToggle,
              className: "w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center shadow-lg transition-colors backdrop-blur-sm",
              title: isMuted ? "Unmute" : "Mute",
              children: isMuted ? /* @__PURE__ */ jsx7("svg", { className: "w-4 h-4", fill: "currentColor", viewBox: "0 0 20 20", children: /* @__PURE__ */ jsx7("path", { fillRule: "evenodd", d: "M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z", clipRule: "evenodd" }) }) : /* @__PURE__ */ jsx7("svg", { className: "w-4 h-4", fill: "currentColor", viewBox: "0 0 20 20", children: /* @__PURE__ */ jsx7("path", { fillRule: "evenodd", d: "M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z", clipRule: "evenodd" }) })
            }
          )
        ] })
      ] }) : /* @__PURE__ */ jsxs5(
        motion2.div,
        {
          initial: { opacity: 0, y: 6 },
          animate: { opacity: 1, y: 0 },
          className: "flex flex-col items-center gap-4 select-none",
          children: [
            /* @__PURE__ */ jsxs5(
              "button",
              {
                onClick: () => {
                  var _a2;
                  return (_a2 = fileInputRef.current) == null ? void 0 : _a2.click();
                },
                className: "flex flex-col items-center gap-3 px-8 py-6 rounded-xl border border-dashed border-zinc-600 hover:border-zinc-400 hover:bg-white/5 transition-colors cursor-pointer group",
                children: [
                  /* @__PURE__ */ jsx7("div", { className: "w-12 h-12 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/15 transition-colors", children: /* @__PURE__ */ jsx7("svg", { className: "w-6 h-6 text-zinc-300", fill: "none", stroke: "currentColor", strokeWidth: 1.5, viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx7("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" }) }) }),
                  /* @__PURE__ */ jsxs5("div", { className: "text-center", children: [
                    /* @__PURE__ */ jsx7("p", { className: "text-sm font-medium text-zinc-200", children: "Import a video" }),
                    /* @__PURE__ */ jsx7("p", { className: "text-xs text-zinc-500 mt-0.5", children: "or drag and drop anywhere" })
                  ] })
                ]
              }
            ),
            /* @__PURE__ */ jsx7(
              "input",
              {
                ref: fileInputRef,
                type: "file",
                accept: "video/*",
                multiple: true,
                className: "hidden",
                onChange: (e) => e.target.files && importFiles(e.target.files)
              }
            )
          ]
        }
      )
    }
  );
}

// components/editor/panels/TrimPanel.tsx
import { useRef as useRef7, useCallback as useCallback8, useEffect as useEffect4, useState as useState2 } from "react";
import { useShallow as useShallow2 } from "zustand/react/shallow";

// lib/timeline/timeUtils.ts
function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor(seconds % 3600 / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor(seconds % 1 * 100);
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(ms).padStart(2, "0")}`;
}

// components/editor/panels/TrimPanel.tsx
import { Fragment as Fragment3, jsx as jsx8, jsxs as jsxs6 } from "react/jsx-runtime";
var STRIP_HEIGHT = 56;
var RULER_H = 20;
var TOTAL_H = RULER_H + STRIP_HEIGHT + 16;
var MIN_CLIP_DURATION = 0.1;
var HANDLE_W = 14;
var thumbCache = /* @__PURE__ */ new Map();
function TrimPanel() {
  var _a, _b, _c;
  const containerRef = useRef7(null);
  const [containerWidth, setContainerWidth] = useState2(0);
  const dragRef = useRef7(null);
  const clips = useEditorStore(useShallow2((s) => s.clips.filter((c) => c.trackId === "track-video")));
  const selectedClipId = useEditorStore((s) => s.selectedClipId);
  const currentTime = useEditorStore((s) => s.currentTime);
  const duration = useEditorStore((s) => s.duration);
  const setCurrentTime = useEditorStore((s) => s.setCurrentTime);
  const trimClipStart = useEditorStore((s) => s.trimClipStart);
  const trimClipEnd = useEditorStore((s) => s.trimClipEnd);
  const setSelectedClip = useEditorStore((s) => s.setSelectedClip);
  const setTrimScrub = useEditorStore((s) => s.setTrimScrub);
  const captureHistory = useEditorStore((s) => s.captureHistory);
  const clip = (_b = (_a = clips.find((c) => c.id === selectedClipId)) != null ? _a : clips[0]) != null ? _b : null;
  useEffect4(() => {
    if (!selectedClipId && clips.length > 0) {
      setSelectedClip(clips[0].id);
    }
  }, [clips, selectedClipId, setSelectedClip]);
  useEffect4(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const sourceDuration = (_c = clip == null ? void 0 : clip.sourceDuration) != null ? _c : 1;
  const zoom = containerWidth > 0 && sourceDuration > 0 ? containerWidth / sourceDuration : 1;
  const [localSourceTime, setLocalSourceTime] = useState2(0);
  const isDraggingRef = useRef7(false);
  const wasPlayingRef = useRef7(false);
  useEffect4(() => {
    if (isDraggingRef.current || !clip) return;
    const src = clip.trimIn + (currentTime - clip.startTime);
    setLocalSourceTime(Math.max(0, Math.min(src, clip.sourceDuration)));
  }, [currentTime, clip]);
  const [thumbs, setThumbs] = useState2(() => {
    var _a2;
    return (_a2 = thumbCache.get("")) != null ? _a2 : [];
  });
  useEffect4(() => {
    if (!clip || containerWidth === 0) return;
    const cached = thumbCache.get(clip.id);
    if (cached) {
      setThumbs(cached);
      return;
    }
    setThumbs([]);
    const aspect = clip.width / clip.height;
    const thumbW = Math.round(STRIP_HEIGHT * aspect);
    const count = Math.max(2, Math.ceil(containerWidth / thumbW));
    const decoder = getDecoderForFile(clip.file);
    const promises = Array.from({ length: count }, (_, i) => {
      const t = i / Math.max(count - 1, 1) * clip.sourceDuration;
      return decoder.requestFrame(clip.file, t).then((frame) => {
        if (!frame) return null;
        const c = document.createElement("canvas");
        c.width = thumbW;
        c.height = STRIP_HEIGHT;
        const ctx = c.getContext("2d");
        if (ctx) ctx.drawImage(frame, 0, 0, thumbW, STRIP_HEIGHT);
        frame.close();
        return c.toDataURL("image/jpeg", 0.65);
      }).catch(() => null);
    });
    Promise.all(promises).then((results) => {
      const valid = results.filter(Boolean);
      if (valid.length > 0) {
        thumbCache.set(clip.id, valid);
        setThumbs(valid);
      }
    });
  }, [clip == null ? void 0 : clip.id, containerWidth]);
  const toX = (sec) => sec * zoom;
  const handlePointerMove = useCallback8(
    (e) => {
      const d = dragRef.current;
      if (!d || !clip || !containerRef.current) return;
      if (d.type === "scrub") {
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const t = Math.max(0, Math.min(x / zoom, clip.sourceDuration));
        setLocalSourceTime(t);
        setTrimScrub({ clipId: clip.id, sourceTime: t });
        return;
      }
      const dxSec = (e.clientX - d.startX) / zoom;
      if (d.type === "trimStart") {
        const newTrimIn = Math.max(0, Math.min(d.startTrimIn + dxSec, d.startTrimOut - MIN_CLIP_DURATION));
        const delta = newTrimIn - d.startTrimIn;
        trimClipStart(clip.id, newTrimIn, d.startClipStartTime + delta, d.startDuration - delta);
      } else if (d.type === "trimEnd") {
        const newTrimOut = Math.min(
          clip.sourceDuration,
          Math.max(d.startTrimOut + dxSec, d.startTrimIn + MIN_CLIP_DURATION)
        );
        const delta = newTrimOut - d.startTrimOut;
        trimClipEnd(clip.id, newTrimOut, d.startDuration + delta);
      }
    },
    [clip, zoom, setTrimScrub, trimClipStart, trimClipEnd]
  );
  const handlePointerUp = useCallback8(() => {
    if (!clip) return;
    const d = dragRef.current;
    dragRef.current = null;
    isDraggingRef.current = false;
    if ((d == null ? void 0 : d.type) === "scrub") {
      setTrimScrub(null);
      const timelineT = clip.startTime + (localSourceTime - clip.trimIn);
      if (wasPlayingRef.current) {
        wasPlayingRef.current = false;
        const decoder = getDecoderForFile(clip.file);
        decoder.startPlayback(localSourceTime);
        useEditorStore.getState().setPlaying(true);
      } else {
        setCurrentTime(Math.max(0, Math.min(timelineT, duration)));
      }
    }
  }, [clip, localSourceTime, duration, setCurrentTime, setTrimScrub]);
  const beginDrag = useCallback8(
    (e, type) => {
      var _a2;
      if (!clip) return;
      e.stopPropagation();
      (_a2 = containerRef.current) == null ? void 0 : _a2.setPointerCapture(e.pointerId);
      isDraggingRef.current = true;
      if (type === "scrub") {
        const isPlaying = useEditorStore.getState().isPlaying;
        wasPlayingRef.current = isPlaying;
        if (isPlaying) pauseAction();
      } else {
        captureHistory();
      }
      dragRef.current = {
        type,
        startX: e.clientX,
        startTrimIn: clip.trimIn,
        startTrimOut: clip.trimOut,
        startClipStartTime: clip.startTime,
        startDuration: clip.duration
      };
    },
    [clip, captureHistory]
  );
  const rulerTicks = [];
  let majorInterval = 1;
  if (sourceDuration > 300) majorInterval = 60;
  else if (sourceDuration > 120) majorInterval = 30;
  else if (sourceDuration > 60) majorInterval = 10;
  else if (sourceDuration > 30) majorInterval = 5;
  const minorInterval = majorInterval / 5;
  for (let t = 0; t <= Math.ceil(sourceDuration); t += minorInterval) {
    rulerTicks.push({ t, isMajor: Math.abs(t % majorInterval) < minorInterval / 2 });
  }
  return /* @__PURE__ */ jsxs6(
    "div",
    {
      ref: containerRef,
      className: "shrink-0 relative border-t border-white/[0.06] bg-[#1a1a1a] overflow-hidden select-none",
      style: { height: TOTAL_H },
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      children: [
        (!clip || containerWidth === 0) && /* @__PURE__ */ jsx8("div", { className: "flex items-center justify-center", style: { height: TOTAL_H }, children: /* @__PURE__ */ jsx8("p", { className: "text-xs text-zinc-600", children: clips.length === 0 ? "Import a video to trim" : "Loading\u2026" }) }),
        clip && containerWidth > 0 && /* @__PURE__ */ jsxs6(Fragment3, { children: [
          /* @__PURE__ */ jsx8(
            "div",
            {
              className: "absolute top-0 left-0 right-0 cursor-col-resize",
              style: { height: RULER_H },
              onPointerDown: (e) => beginDrag(e, "scrub"),
              children: rulerTicks.map(({ t, isMajor }) => /* @__PURE__ */ jsxs6("div", { className: "absolute top-0 flex flex-col", style: { left: toX(t) }, children: [
                /* @__PURE__ */ jsx8("div", { className: `w-px ${isMajor ? "h-2.5 bg-zinc-500" : "h-1.5 bg-zinc-700"}` }),
                isMajor && /* @__PURE__ */ jsx8("span", { className: "text-[9px] text-zinc-500 ml-1 leading-none tabular-nums", children: formatTime(t) })
              ] }, t))
            }
          ),
          /* @__PURE__ */ jsxs6(
            "div",
            {
              className: "absolute left-0 right-0 cursor-col-resize",
              style: { top: RULER_H, height: STRIP_HEIGHT },
              onPointerDown: (e) => beginDrag(e, "scrub"),
              children: [
                thumbs.length > 0 ? /* @__PURE__ */ jsx8("div", { className: "flex h-full pointer-events-none", children: thumbs.map((src, i) => /* @__PURE__ */ jsx8(
                  "img",
                  {
                    src,
                    alt: "",
                    className: "h-full flex-1 object-cover",
                    draggable: false,
                    style: { filter: "brightness(0.4)" }
                  },
                  i
                )) }) : /* @__PURE__ */ jsx8("div", { className: "w-full h-full bg-zinc-900 flex items-center justify-center pointer-events-none", children: /* @__PURE__ */ jsx8("div", { className: "w-4 h-4 border-2 border-zinc-600 border-t-zinc-400 rounded-full animate-spin" }) }),
                (() => {
                  const selLeft = toX(clip.trimIn);
                  const selWidth = Math.max(toX(clip.trimOut) - toX(clip.trimIn), HANDLE_W * 2 + 4);
                  return /* @__PURE__ */ jsxs6(Fragment3, { children: [
                    /* @__PURE__ */ jsx8(
                      "div",
                      {
                        className: "absolute top-0 overflow-hidden pointer-events-none",
                        style: { left: selLeft, width: selWidth, height: STRIP_HEIGHT },
                        children: thumbs.length > 0 && /* @__PURE__ */ jsx8("div", { className: "flex h-full", style: { width: containerWidth, marginLeft: -selLeft }, children: thumbs.map((src, i) => /* @__PURE__ */ jsx8("img", { src, alt: "", className: "h-full flex-1 object-cover", draggable: false }, i)) })
                      }
                    ),
                    /* @__PURE__ */ jsx8(
                      "div",
                      {
                        className: "absolute top-0 pointer-events-none",
                        style: {
                          left: selLeft,
                          width: selWidth,
                          height: STRIP_HEIGHT,
                          border: "2px solid rgba(251,191,36,0.9)",
                          borderRadius: 2
                        }
                      }
                    ),
                    /* @__PURE__ */ jsx8(
                      "div",
                      {
                        className: "absolute top-0 bottom-0 flex items-center justify-center bg-amber-400 cursor-w-resize rounded-l",
                        style: { left: selLeft, width: HANDLE_W, zIndex: 10 },
                        onPointerDown: (e) => beginDrag(e, "trimStart"),
                        children: /* @__PURE__ */ jsxs6("div", { className: "flex gap-0.5 pointer-events-none", children: [
                          /* @__PURE__ */ jsx8("div", { className: "w-0.5 h-5 bg-amber-900/60 rounded-full" }),
                          /* @__PURE__ */ jsx8("div", { className: "w-0.5 h-5 bg-amber-900/60 rounded-full" })
                        ] })
                      }
                    ),
                    /* @__PURE__ */ jsx8(
                      "div",
                      {
                        className: "absolute top-0 bottom-0 flex items-center justify-center bg-amber-400 cursor-e-resize rounded-r",
                        style: { left: selLeft + selWidth - HANDLE_W, width: HANDLE_W, zIndex: 10 },
                        onPointerDown: (e) => beginDrag(e, "trimEnd"),
                        children: /* @__PURE__ */ jsxs6("div", { className: "flex gap-0.5 pointer-events-none", children: [
                          /* @__PURE__ */ jsx8("div", { className: "w-0.5 h-5 bg-amber-900/60 rounded-full" }),
                          /* @__PURE__ */ jsx8("div", { className: "w-0.5 h-5 bg-amber-900/60 rounded-full" })
                        ] })
                      }
                    ),
                    /* @__PURE__ */ jsx8(
                      "div",
                      {
                        className: "absolute pointer-events-none text-[9px] font-semibold tabular-nums text-white bg-black/60 px-1 rounded",
                        style: { left: selLeft + HANDLE_W + 2, top: 2 },
                        children: formatTime(clip.trimIn)
                      }
                    ),
                    /* @__PURE__ */ jsx8(
                      "div",
                      {
                        className: "absolute pointer-events-none text-[9px] font-semibold tabular-nums text-white bg-black/60 px-1 rounded",
                        style: { left: selLeft + selWidth - HANDLE_W - 36, top: 2 },
                        children: formatTime(clip.trimOut)
                      }
                    )
                  ] });
                })()
              ]
            }
          ),
          /* @__PURE__ */ jsxs6(
            "div",
            {
              className: "absolute top-0 z-20 pointer-events-none",
              style: { left: toX(localSourceTime), bottom: 0 },
              children: [
                /* @__PURE__ */ jsx8(
                  "div",
                  {
                    className: "absolute w-px bg-white/80",
                    style: { top: RULER_H - 2, bottom: 0, left: 0, transform: "translateX(-50%)" }
                  }
                ),
                /* @__PURE__ */ jsx8(
                  "div",
                  {
                    className: "absolute -translate-x-1/2 bg-zinc-900 text-white border border-white/20 rounded px-1.5 py-0.5 text-[10px] font-semibold tabular-nums cursor-col-resize pointer-events-auto",
                    style: { top: 0 },
                    onPointerDown: (e) => beginDrag(e, "scrub"),
                    children: formatTime(localSourceTime)
                  }
                ),
                /* @__PURE__ */ jsx8(
                  "div",
                  {
                    className: "absolute -translate-x-1/2",
                    style: {
                      top: RULER_H - 1,
                      width: 0,
                      height: 0,
                      borderLeft: "5px solid transparent",
                      borderRight: "5px solid transparent",
                      borderTop: "6px solid rgba(255,255,255,0.8)"
                    }
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ jsxs6(
            "div",
            {
              className: "absolute right-3 pointer-events-none text-[10px] font-semibold tabular-nums text-zinc-400 bg-black/40 px-1.5 py-0.5 rounded",
              style: { top: RULER_H + 2 },
              children: [
                formatTime(clip.trimOut - clip.trimIn),
                " / ",
                formatTime(clip.sourceDuration)
              ]
            }
          )
        ] })
      ]
    }
  );
}

// components/editor/panels/FinetunePanel.tsx
import { jsx as jsx9, jsxs as jsxs7 } from "react/jsx-runtime";
function SliderRow({ label, value, min, max, onValueChange, onPointerDown, displayValue }) {
  const pct = (value - min) / (max - min) * 100;
  return /* @__PURE__ */ jsxs7("div", { className: "flex items-center gap-3", children: [
    /* @__PURE__ */ jsx9("span", { className: "text-xs text-zinc-400 w-20 shrink-0", children: label }),
    /* @__PURE__ */ jsxs7("div", { className: "relative flex-1 h-5 flex items-center", children: [
      /* @__PURE__ */ jsx9("div", { className: "absolute inset-x-0 h-1 rounded-full bg-zinc-700", children: /* @__PURE__ */ jsx9("div", { className: "h-full rounded-full bg-white/60", style: { width: `${pct}%` } }) }),
      /* @__PURE__ */ jsx9(
        "div",
        {
          className: "absolute w-3.5 h-3.5 rounded-full bg-white shadow-md pointer-events-none",
          style: { left: `calc(${pct}% - 7px)` }
        }
      ),
      /* @__PURE__ */ jsx9(
        "input",
        {
          type: "range",
          min,
          max,
          value,
          onChange: (e) => onValueChange(Number(e.target.value)),
          onPointerDown,
          className: "absolute inset-0 w-full opacity-0 cursor-pointer h-5"
        }
      )
    ] }),
    /* @__PURE__ */ jsx9("span", { className: "text-xs text-zinc-400 w-8 text-right tabular-nums shrink-0", children: displayValue != null ? displayValue : value })
  ] });
}
function FinetunePanel() {
  var _a, _b, _c;
  const selectedClipId = useEditorStore((s) => s.selectedClipId);
  const clipEffects = useEditorStore((s) => s.clipEffects);
  const setClipEffect = useEditorStore((s) => s.setClipEffect);
  const resetClipEffects = useEditorStore((s) => s.resetClipEffects);
  const captureHistory = useEditorStore((s) => s.captureHistory);
  const clips = useEditorStore((s) => s.clips);
  const targetId = (_b = selectedClipId != null ? selectedClipId : (_a = clips.find((c) => c.trackId === "track-video")) == null ? void 0 : _a.id) != null ? _b : null;
  const effects = targetId ? (_c = clipEffects[targetId]) != null ? _c : DEFAULT_EFFECTS : DEFAULT_EFFECTS;
  const set = (key, v) => {
    if (targetId) setClipEffect(targetId, key, v);
  };
  const handleSliderPointerDown = () => captureHistory();
  return /* @__PURE__ */ jsxs7("div", { className: "shrink-0 border-t border-white/[0.06] bg-[#1a1a1a] px-6 py-4", style: { height: 180 }, children: [
    /* @__PURE__ */ jsxs7("div", { className: "flex items-center justify-between mb-3", children: [
      /* @__PURE__ */ jsx9("span", { className: "text-xs font-semibold text-zinc-300 uppercase tracking-wider", children: "Adjustments" }),
      targetId && /* @__PURE__ */ jsx9(
        "button",
        {
          onClick: () => resetClipEffects(targetId),
          className: "text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors",
          children: "Reset"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs7("div", { className: "grid grid-cols-2 gap-x-8 gap-y-2.5", children: [
      /* @__PURE__ */ jsx9(
        SliderRow,
        {
          label: "Brightness",
          value: effects.brightness,
          min: -100,
          max: 100,
          onValueChange: (v) => set("brightness", v),
          onPointerDown: handleSliderPointerDown
        }
      ),
      /* @__PURE__ */ jsx9(
        SliderRow,
        {
          label: "Contrast",
          value: effects.contrast,
          min: -100,
          max: 100,
          onValueChange: (v) => set("contrast", v),
          onPointerDown: handleSliderPointerDown
        }
      ),
      /* @__PURE__ */ jsx9(
        SliderRow,
        {
          label: "Saturation",
          value: effects.saturation,
          min: -100,
          max: 100,
          onValueChange: (v) => set("saturation", v),
          onPointerDown: handleSliderPointerDown
        }
      ),
      /* @__PURE__ */ jsx9(
        SliderRow,
        {
          label: "Rotation",
          value: effects.rotation,
          min: -180,
          max: 180,
          displayValue: `${effects.rotation}\xB0`,
          onValueChange: (v) => set("rotation", v),
          onPointerDown: handleSliderPointerDown
        }
      ),
      /* @__PURE__ */ jsx9(
        SliderRow,
        {
          label: "Opacity",
          value: Math.round(effects.opacity * 100),
          min: 0,
          max: 100,
          displayValue: `${Math.round(effects.opacity * 100)}%`,
          onValueChange: (v) => set("opacity", v / 100),
          onPointerDown: handleSliderPointerDown
        }
      )
    ] })
  ] });
}

// components/editor/panels/FilterPanel.tsx
import { jsx as jsx10, jsxs as jsxs8 } from "react/jsx-runtime";
var PRESETS = [
  {
    id: "original",
    label: "Original",
    effects: { brightness: 0, contrast: 0, saturation: 0 },
    cssFilter: "none"
  },
  {
    id: "vivid",
    label: "Vivid",
    effects: { brightness: 10, contrast: 20, saturation: 40 },
    cssFilter: "brightness(1.1) contrast(1.2) saturate(1.4)"
  },
  {
    id: "warm",
    label: "Warm",
    effects: { brightness: 8, contrast: 5, saturation: 15 },
    cssFilter: "brightness(1.08) contrast(1.05) saturate(1.15) sepia(0.2)"
  },
  {
    id: "cool",
    label: "Cool",
    effects: { brightness: 5, contrast: 10, saturation: -10 },
    cssFilter: "brightness(1.05) contrast(1.1) saturate(0.9) hue-rotate(20deg)"
  },
  {
    id: "bw",
    label: "B&W",
    effects: { brightness: 5, contrast: 15, saturation: -100 },
    cssFilter: "grayscale(1) brightness(1.05) contrast(1.15)"
  },
  {
    id: "fade",
    label: "Fade",
    effects: { brightness: 20, contrast: -20, saturation: -20 },
    cssFilter: "brightness(1.2) contrast(0.8) saturate(0.8)"
  },
  {
    id: "dramatic",
    label: "Dramatic",
    effects: { brightness: -5, contrast: 40, saturation: 20 },
    cssFilter: "brightness(0.95) contrast(1.4) saturate(1.2)"
  },
  {
    id: "film",
    label: "Film",
    effects: { brightness: -5, contrast: 10, saturation: -15 },
    cssFilter: "brightness(0.95) contrast(1.1) saturate(0.85) sepia(0.1)"
  },
  {
    id: "matte",
    label: "Matte",
    effects: { brightness: 15, contrast: -10, saturation: -30 },
    cssFilter: "brightness(1.15) contrast(0.9) saturate(0.7)"
  }
];
function FilterPanel() {
  var _a, _b, _c, _d, _e;
  const selectedClipId = useEditorStore((s) => s.selectedClipId);
  const clips = useEditorStore((s) => s.clips);
  const clipEffects = useEditorStore((s) => s.clipEffects);
  const setClipEffects = useEditorStore((s) => s.setClipEffects);
  const captureHistory = useEditorStore((s) => s.captureHistory);
  const targetId = (_b = selectedClipId != null ? selectedClipId : (_a = clips.find((c) => c.trackId === "track-video")) == null ? void 0 : _a.id) != null ? _b : null;
  const effects = targetId ? (_c = clipEffects[targetId]) != null ? _c : DEFAULT_EFFECTS : DEFAULT_EFFECTS;
  const activePreset = (_e = (_d = PRESETS.find(
    (p) => {
      var _a2, _b2, _c2;
      return ((_a2 = p.effects.brightness) != null ? _a2 : 0) === effects.brightness && ((_b2 = p.effects.contrast) != null ? _b2 : 0) === effects.contrast && ((_c2 = p.effects.saturation) != null ? _c2 : 0) === effects.saturation;
    }
  )) == null ? void 0 : _d.id) != null ? _e : null;
  const applyPreset = (preset) => {
    if (!targetId) return;
    captureHistory();
    setClipEffects(targetId, preset.effects);
  };
  return /* @__PURE__ */ jsxs8("div", { className: "shrink-0 border-t border-white/[0.06] bg-[#1a1a1a] px-4 py-3", style: { height: 120 }, children: [
    /* @__PURE__ */ jsx10("div", { className: "flex items-center justify-between mb-2.5", children: /* @__PURE__ */ jsx10("span", { className: "text-xs font-semibold text-zinc-300 uppercase tracking-wider", children: "Filters" }) }),
    /* @__PURE__ */ jsx10("div", { className: "flex gap-2 overflow-x-auto pb-1 scrollbar-hide", children: PRESETS.map((preset) => /* @__PURE__ */ jsxs8(
      "button",
      {
        onClick: () => applyPreset(preset),
        className: "shrink-0 flex flex-col items-center gap-1.5 group",
        children: [
          /* @__PURE__ */ jsx10(
            "div",
            {
              className: "w-14 h-10 rounded-md overflow-hidden border-2 transition-colors",
              style: {
                borderColor: activePreset === preset.id ? "rgb(251,191,36)" : "transparent"
              },
              children: /* @__PURE__ */ jsx10(
                "div",
                {
                  className: "w-full h-full",
                  style: {
                    background: "linear-gradient(135deg, #6b7280 0%, #374151 50%, #9ca3af 100%)",
                    filter: preset.cssFilter
                  }
                }
              )
            }
          ),
          /* @__PURE__ */ jsx10(
            "span",
            {
              className: "text-[10px] leading-none transition-colors",
              style: { color: activePreset === preset.id ? "rgb(251,191,36)" : "rgb(113,113,122)" },
              children: preset.label
            }
          )
        ]
      },
      preset.id
    )) })
  ] });
}

// components/editor/panels/CropPanel.tsx
import { jsx as jsx11, jsxs as jsxs9 } from "react/jsx-runtime";
var ASPECT_PRESETS = [
  { label: "Free", ratio: null },
  { label: "16:9", ratio: [16, 9] },
  { label: "9:16", ratio: [9, 16] },
  { label: "4:3", ratio: [4, 3] },
  { label: "3:4", ratio: [3, 4] },
  { label: "1:1", ratio: [1, 1] }
];
function CropPanel() {
  var _a, _b, _c;
  const selectedClipId = useEditorStore((s) => s.selectedClipId);
  const clips = useEditorStore((s) => s.clips);
  const clipEffects = useEditorStore((s) => s.clipEffects);
  const setClipEffects = useEditorStore((s) => s.setClipEffects);
  const resetClipEffects = useEditorStore((s) => s.resetClipEffects);
  const captureHistory = useEditorStore((s) => s.captureHistory);
  const targetId = (_b = selectedClipId != null ? selectedClipId : (_a = clips.find((c) => c.trackId === "track-video")) == null ? void 0 : _a.id) != null ? _b : null;
  const effects = targetId ? (_c = clipEffects[targetId]) != null ? _c : DEFAULT_EFFECTS : DEFAULT_EFFECTS;
  const applyCrop = (ratio) => {
    if (!targetId) return;
    captureHistory();
    if (!ratio) {
      setClipEffects(targetId, { cropX: 0, cropY: 0, cropW: 1, cropH: 1 });
      return;
    }
    const clip = clips.find((c) => c.id === targetId);
    if (!clip) return;
    const videoAspect = clip.width / clip.height;
    const targetAspect = ratio[0] / ratio[1];
    let cropW = 1, cropH = 1, cropX = 0, cropY = 0;
    if (targetAspect < videoAspect) {
      cropW = clip.height * targetAspect / clip.width;
      cropX = (1 - cropW) / 2;
    } else {
      cropH = clip.width / targetAspect / clip.height;
      cropY = (1 - cropH) / 2;
    }
    setClipEffects(targetId, { cropX, cropY, cropW, cropH });
  };
  const resetCrop = () => {
    if (!targetId) return;
    captureHistory();
    setClipEffects(targetId, { cropX: 0, cropY: 0, cropW: 1, cropH: 1 });
  };
  const isDefaultCrop = effects.cropX === 0 && effects.cropY === 0 && effects.cropW === 1 && effects.cropH === 1;
  return /* @__PURE__ */ jsxs9("div", { className: "shrink-0 border-t border-white/[0.06] bg-[#1a1a1a] px-5 py-3", style: { height: 100 }, children: [
    /* @__PURE__ */ jsxs9("div", { className: "flex items-center justify-between mb-2.5", children: [
      /* @__PURE__ */ jsx11("span", { className: "text-[10px] font-semibold text-zinc-500 uppercase tracking-wider", children: "Aspect Ratio" }),
      !isDefaultCrop && /* @__PURE__ */ jsx11(
        "button",
        {
          onClick: resetCrop,
          className: "text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors",
          children: "Reset"
        }
      )
    ] }),
    /* @__PURE__ */ jsx11("div", { className: "flex gap-1.5 flex-wrap", children: ASPECT_PRESETS.map((preset) => {
      const isActive = preset.ratio === null ? isDefaultCrop : (() => {
        if (!clips.find((c) => c.id === targetId)) return false;
        const clip = clips.find((c) => c.id === targetId);
        const videoAspect = clip.width / clip.height;
        const targetAspect = preset.ratio[0] / preset.ratio[1];
        let expectedW = 1, expectedH = 1, expectedX = 0, expectedY = 0;
        if (targetAspect < videoAspect) {
          expectedW = clip.height * targetAspect / clip.width;
          expectedX = (1 - expectedW) / 2;
        } else {
          expectedH = clip.width / targetAspect / clip.height;
          expectedY = (1 - expectedH) / 2;
        }
        return Math.abs(effects.cropX - expectedX) < 0.01 && Math.abs(effects.cropY - expectedY) < 0.01 && Math.abs(effects.cropW - expectedW) < 0.01 && Math.abs(effects.cropH - expectedH) < 0.01;
      })();
      return /* @__PURE__ */ jsx11(
        "button",
        {
          onClick: () => applyCrop(preset.ratio),
          className: "px-2.5 py-1 rounded text-xs font-medium transition-colors",
          style: {
            background: isActive ? "rgba(251,191,36,0.15)" : "rgba(255,255,255,0.05)",
            color: isActive ? "rgb(251,191,36)" : "rgb(161,161,170)",
            border: `1px solid ${isActive ? "rgba(251,191,36,0.4)" : "transparent"}`
          },
          children: preset.label
        },
        preset.label
      );
    }) }),
    /* @__PURE__ */ jsx11("p", { className: "text-[10px] text-zinc-600 mt-2", children: "Drag handles in preview to adjust crop freely" })
  ] });
}

// components/editor/panels/ResizePanel.tsx
import { jsx as jsx12, jsxs as jsxs10 } from "react/jsx-runtime";
var RESOLUTIONS = [
  { label: "Original", value: "original", desc: "Keep source resolution" },
  { label: "1080p", value: "1080p", desc: "1920 \xD7 1080" },
  { label: "720p", value: "720p", desc: "1280 \xD7 720" },
  { label: "480p", value: "480p", desc: "854 \xD7 480" }
];
var FPS_OPTIONS = [
  { label: "24 fps", value: 24 },
  { label: "30 fps", value: 30 },
  { label: "60 fps", value: 60 }
];
function ResizePanel() {
  const settings = useEditorStore((s) => s.settings);
  const updateSettings = useEditorStore((s) => s.updateExportSettings);
  return /* @__PURE__ */ jsx12("div", { className: "shrink-0 border-t border-white/[0.06] bg-[#1a1a1a] px-5 py-3", style: { height: 120 }, children: /* @__PURE__ */ jsxs10("div", { className: "flex gap-8", children: [
    /* @__PURE__ */ jsxs10("div", { className: "flex-1", children: [
      /* @__PURE__ */ jsx12("span", { className: "text-[10px] font-semibold text-zinc-500 uppercase tracking-wider", children: "Resolution" }),
      /* @__PURE__ */ jsx12("div", { className: "flex gap-1.5 mt-2 flex-wrap", children: RESOLUTIONS.map((r) => /* @__PURE__ */ jsx12(
        "button",
        {
          onClick: () => updateSettings({ resolution: r.value }),
          title: r.desc,
          className: "px-2.5 py-1 rounded text-xs font-medium transition-colors",
          style: {
            background: settings.resolution === r.value ? "rgba(251,191,36,0.15)" : "rgba(255,255,255,0.05)",
            color: settings.resolution === r.value ? "rgb(251,191,36)" : "rgb(161,161,170)",
            border: `1px solid ${settings.resolution === r.value ? "rgba(251,191,36,0.4)" : "transparent"}`
          },
          children: r.label
        },
        r.value
      )) })
    ] }),
    /* @__PURE__ */ jsxs10("div", { className: "flex-1", children: [
      /* @__PURE__ */ jsx12("span", { className: "text-[10px] font-semibold text-zinc-500 uppercase tracking-wider", children: "Frame Rate" }),
      /* @__PURE__ */ jsx12("div", { className: "flex gap-1.5 mt-2", children: FPS_OPTIONS.map((f) => /* @__PURE__ */ jsx12(
        "button",
        {
          onClick: () => updateSettings({ fps: f.value }),
          className: "px-2.5 py-1 rounded text-xs font-medium transition-colors",
          style: {
            background: settings.fps === f.value ? "rgba(251,191,36,0.15)" : "rgba(255,255,255,0.05)",
            color: settings.fps === f.value ? "rgb(251,191,36)" : "rgb(161,161,170)",
            border: `1px solid ${settings.fps === f.value ? "rgba(251,191,36,0.4)" : "transparent"}`
          },
          children: f.label
        },
        f.value
      )) })
    ] }),
    /* @__PURE__ */ jsxs10("div", { className: "flex-1", children: [
      /* @__PURE__ */ jsx12("span", { className: "text-[10px] font-semibold text-zinc-500 uppercase tracking-wider", children: "Format" }),
      /* @__PURE__ */ jsx12("div", { className: "flex gap-1.5 mt-2", children: ["mp4", "webm"].map((fmt) => /* @__PURE__ */ jsx12(
        "button",
        {
          onClick: () => updateSettings({ format: fmt }),
          className: "px-2.5 py-1 rounded text-xs font-medium uppercase transition-colors",
          style: {
            background: settings.format === fmt ? "rgba(251,191,36,0.15)" : "rgba(255,255,255,0.05)",
            color: settings.format === fmt ? "rgb(251,191,36)" : "rgb(161,161,170)",
            border: `1px solid ${settings.format === fmt ? "rgba(251,191,36,0.4)" : "transparent"}`
          },
          children: fmt
        },
        fmt
      )) })
    ] })
  ] }) });
}

// components/editor/panels/AnnotatePanel.tsx
import { jsx as jsx13, jsxs as jsxs11 } from "react/jsx-runtime";
var COLORS = ["#ff0000", "#ff9900", "#ffff00", "#00ff00", "#00cfff", "#ffffff", "#000000"];
var WIDTHS = [2, 4, 8, 16];
function AnnotatePanel() {
  const drawingTool = useEditorStore((s) => s.drawingTool);
  const drawingColor = useEditorStore((s) => s.drawingColor);
  const drawingWidth = useEditorStore((s) => s.drawingWidth);
  const setDrawingTool = useEditorStore((s) => s.setDrawingTool);
  const setDrawingColor = useEditorStore((s) => s.setDrawingColor);
  const setDrawingWidth = useEditorStore((s) => s.setDrawingWidth);
  const undoStroke = useEditorStore((s) => s.undoStroke);
  const clearStrokes = useEditorStore((s) => s.clearStrokes);
  const strokes = useEditorStore((s) => s.strokes);
  return /* @__PURE__ */ jsx13("div", { className: "shrink-0 border-t border-white/[0.06] bg-[#1a1a1a] px-5 py-3", style: { height: 90 }, children: /* @__PURE__ */ jsxs11("div", { className: "flex items-center gap-6 h-full", children: [
    /* @__PURE__ */ jsxs11("div", { className: "flex flex-col gap-1", children: [
      /* @__PURE__ */ jsx13("span", { className: "text-[9px] font-semibold text-zinc-500 uppercase tracking-wider", children: "Tool" }),
      /* @__PURE__ */ jsxs11("div", { className: "flex gap-1", children: [
        /* @__PURE__ */ jsx13(
          "button",
          {
            onClick: () => setDrawingTool("pen"),
            className: `px-3 py-1.5 rounded text-xs font-medium transition-colors ${drawingTool === "pen" ? "bg-amber-400 text-black" : "bg-white/[0.07] text-zinc-400 hover:text-zinc-200"}`,
            children: "Pen"
          }
        ),
        /* @__PURE__ */ jsx13(
          "button",
          {
            onClick: () => setDrawingTool("eraser"),
            className: `px-3 py-1.5 rounded text-xs font-medium transition-colors ${drawingTool === "eraser" ? "bg-amber-400 text-black" : "bg-white/[0.07] text-zinc-400 hover:text-zinc-200"}`,
            children: "Eraser"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs11("div", { className: "flex flex-col gap-1", children: [
      /* @__PURE__ */ jsx13("span", { className: "text-[9px] font-semibold text-zinc-500 uppercase tracking-wider", children: "Color" }),
      /* @__PURE__ */ jsx13("div", { className: "flex gap-1.5", children: COLORS.map((c) => /* @__PURE__ */ jsx13(
        "button",
        {
          onClick: () => setDrawingColor(c),
          className: "w-5 h-5 rounded-full border-2 transition-transform hover:scale-110",
          style: {
            background: c,
            borderColor: drawingColor === c ? "white" : "transparent",
            boxShadow: c === "#ffffff" ? "inset 0 0 0 1px rgba(255,255,255,0.3)" : void 0
          }
        },
        c
      )) })
    ] }),
    /* @__PURE__ */ jsxs11("div", { className: "flex flex-col gap-1", children: [
      /* @__PURE__ */ jsx13("span", { className: "text-[9px] font-semibold text-zinc-500 uppercase tracking-wider", children: "Width" }),
      /* @__PURE__ */ jsx13("div", { className: "flex gap-1 items-center", children: WIDTHS.map((w) => /* @__PURE__ */ jsx13(
        "button",
        {
          onClick: () => setDrawingWidth(w),
          className: `flex items-center justify-center w-8 h-7 rounded transition-colors ${drawingWidth === w ? "bg-amber-400/20 ring-1 ring-amber-400" : "bg-white/[0.07] hover:bg-white/[0.12]"}`,
          children: /* @__PURE__ */ jsx13(
            "div",
            {
              className: "rounded-full bg-white",
              style: { width: Math.min(w * 2, 20), height: Math.min(w / 2 + 2, 8) }
            }
          )
        },
        w
      )) })
    ] }),
    /* @__PURE__ */ jsxs11("div", { className: "flex flex-col gap-1 ml-auto", children: [
      /* @__PURE__ */ jsx13("span", { className: "text-[9px] font-semibold text-zinc-500 uppercase tracking-wider", children: "Actions" }),
      /* @__PURE__ */ jsxs11("div", { className: "flex gap-1", children: [
        /* @__PURE__ */ jsx13(
          "button",
          {
            onClick: undoStroke,
            disabled: strokes.length === 0,
            className: "px-3 py-1.5 rounded text-xs font-medium bg-white/[0.07] text-zinc-400 hover:text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors",
            children: "Undo"
          }
        ),
        /* @__PURE__ */ jsx13(
          "button",
          {
            onClick: clearStrokes,
            disabled: strokes.length === 0,
            className: "px-3 py-1.5 rounded text-xs font-medium bg-white/[0.07] text-red-400/80 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors",
            children: "Clear"
          }
        )
      ] })
    ] })
  ] }) });
}

// components/editor/panels/StickerPanel.tsx
import { useRef as useRef8 } from "react";
import { jsx as jsx14, jsxs as jsxs12 } from "react/jsx-runtime";
var STICKER_GROUPS = [
  {
    label: "Reactions",
    emojis: ["\u{1F600}", "\u{1F602}", "\u{1F60D}", "\u{1F970}", "\u{1F60E}", "\u{1F929}", "\u{1F631}", "\u{1F914}", "\u{1F634}", "\u{1F973}"]
  },
  {
    label: "Symbols",
    emojis: ["\u2764\uFE0F", "\u{1F4AF}", "\u{1F525}", "\u2B50", "\u2728", "\u{1F4AB}", "\u{1F389}", "\u{1F38A}", "\u{1F44D}", "\u{1F44E}"]
  },
  {
    label: "Nature",
    emojis: ["\u{1F31F}", "\u{1F308}", "\u2600\uFE0F", "\u{1F319}", "\u26A1", "\u2744\uFE0F", "\u{1F338}", "\u{1F340}", "\u{1F98B}", "\u{1F43E}"]
  },
  {
    label: "Objects",
    emojis: ["\u{1F3AC}", "\u{1F4F8}", "\u{1F3B5}", "\u{1F3AE}", "\u{1F48E}", "\u{1F3C6}", "\u{1F3AF}", "\u{1F680}", "\u{1F4A1}", "\u{1F511}"]
  }
];
function StickerPanel() {
  const addStickerOverlay = useEditorStore((s) => s.addStickerOverlay);
  const overlays = useEditorStore((s) => s.overlays);
  const removeOverlay = useEditorStore((s) => s.removeOverlay);
  const imageInputRef = useRef8(null);
  const stickerOverlays = overlays.filter((o) => o.type === "sticker");
  const handleAddEmoji = (emoji) => {
    addStickerOverlay({ emoji, x: 0.5, y: 0.5, scale: 1 });
  };
  const handleImageUpload = (e) => {
    var _a;
    const file = (_a = e.target.files) == null ? void 0 : _a[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      addStickerOverlay({
        emoji: "",
        imageUrl: reader.result,
        x: 0.5,
        y: 0.5,
        scale: 1
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };
  return /* @__PURE__ */ jsx14(
    "div",
    {
      className: "shrink-0 border-t border-white/[0.06] bg-[#1a1a1a] px-4 py-3 overflow-y-auto",
      style: { height: 160 },
      children: /* @__PURE__ */ jsxs12("div", { className: "flex gap-4 h-full", children: [
        /* @__PURE__ */ jsxs12("div", { className: "flex-1 min-w-0 overflow-y-auto", children: [
          /* @__PURE__ */ jsxs12("div", { className: "mb-2", children: [
            /* @__PURE__ */ jsxs12(
              "button",
              {
                onClick: () => {
                  var _a;
                  return (_a = imageInputRef.current) == null ? void 0 : _a.click();
                },
                className: "flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-white/[0.06] hover:bg-white/10 text-zinc-300 border border-white/10 transition-colors",
                children: [
                  /* @__PURE__ */ jsx14("svg", { className: "w-3.5 h-3.5", fill: "none", stroke: "currentColor", strokeWidth: 1.75, viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx14("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" }) }),
                  "Upload image"
                ]
              }
            ),
            /* @__PURE__ */ jsx14(
              "input",
              {
                ref: imageInputRef,
                type: "file",
                accept: "image/*",
                className: "hidden",
                onChange: handleImageUpload
              }
            )
          ] }),
          STICKER_GROUPS.map((group) => /* @__PURE__ */ jsxs12("div", { className: "mb-2", children: [
            /* @__PURE__ */ jsx14("span", { className: "text-[10px] font-semibold text-zinc-600 uppercase tracking-wider block mb-1", children: group.label }),
            /* @__PURE__ */ jsx14("div", { className: "flex flex-wrap gap-1", children: group.emojis.map((emoji) => /* @__PURE__ */ jsx14(
              "button",
              {
                onClick: () => handleAddEmoji(emoji),
                className: "w-8 h-8 flex items-center justify-center rounded hover:bg-white/10 transition-colors text-lg",
                title: `Add ${emoji}`,
                children: emoji
              },
              emoji
            )) })
          ] }, group.label))
        ] }),
        /* @__PURE__ */ jsxs12("div", { className: "w-36 shrink-0 flex flex-col gap-1.5", children: [
          /* @__PURE__ */ jsxs12("span", { className: "text-[10px] font-semibold text-zinc-500 uppercase tracking-wider", children: [
            "Active (",
            stickerOverlays.length,
            ")"
          ] }),
          /* @__PURE__ */ jsxs12("div", { className: "flex flex-col gap-1 overflow-y-auto", children: [
            stickerOverlays.length === 0 && /* @__PURE__ */ jsx14("span", { className: "text-[11px] text-zinc-600", children: "Click to add stickers" }),
            stickerOverlays.map((o) => {
              if (o.type !== "sticker") return null;
              return /* @__PURE__ */ jsxs12(
                "div",
                {
                  className: "flex items-center justify-between px-2 py-1 rounded bg-white/[0.04]",
                  children: [
                    o.imageUrl ? /* @__PURE__ */ jsx14("img", { src: o.imageUrl, alt: "", className: "w-6 h-6 object-cover rounded" }) : /* @__PURE__ */ jsx14("span", { className: "text-lg", children: o.emoji }),
                    /* @__PURE__ */ jsx14(
                      "button",
                      {
                        onClick: () => removeOverlay(o.id),
                        className: "text-zinc-600 hover:text-red-400 transition-colors",
                        children: /* @__PURE__ */ jsx14("svg", { className: "w-3 h-3", fill: "currentColor", viewBox: "0 0 20 20", children: /* @__PURE__ */ jsx14("path", { fillRule: "evenodd", d: "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z", clipRule: "evenodd" }) })
                      }
                    )
                  ]
                },
                o.id
              );
            })
          ] })
        ] })
      ] })
    }
  );
}

// hooks/useKeyboardShortcuts.ts
import { useEffect as useEffect5 } from "react";
function useKeyboardShortcuts() {
  const setCurrentTime = useEditorStore((s) => s.setCurrentTime);
  const setZoomFn = useEditorStore((s) => s.setZoom);
  const splitClipAt = useEditorStore((s) => s.splitClipAt);
  const selectedClipId = useEditorStore((s) => s.selectedClipId);
  const removeClip = useEditorStore((s) => s.removeClip);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const captureHistory = useEditorStore((s) => s.captureHistory);
  useEffect5(() => {
    const handler = (e) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const { currentTime, fps, duration, zoom } = useEditorStore.getState();
      switch (e.key) {
        case " ":
          e.preventDefault();
          togglePlayAction();
          break;
        case "ArrowLeft":
          e.preventDefault();
          setCurrentTime(currentTime - (e.shiftKey ? 1 : 1 / fps));
          break;
        case "ArrowRight":
          e.preventDefault();
          setCurrentTime(currentTime + (e.shiftKey ? 1 : 1 / fps));
          break;
        case "Home":
          e.preventDefault();
          setCurrentTime(0);
          break;
        case "End":
          e.preventDefault();
          setCurrentTime(duration);
          break;
        case "=":
        case "+":
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault();
            setZoomFn(zoom * 1.25);
          }
          break;
        case "-":
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault();
            setZoomFn(zoom / 1.25);
          }
          break;
        case "z":
        case "Z":
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault();
            if (e.shiftKey) redo();
            else undo();
          }
          break;
        case "s":
        case "S":
          if (selectedClipId) {
            e.preventDefault();
            captureHistory();
            splitClipAt(selectedClipId, currentTime);
          }
          break;
        case "Delete":
        case "Backspace":
          if (selectedClipId) {
            e.preventDefault();
            captureHistory();
            removeClip(selectedClipId);
          }
          break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setCurrentTime, setZoomFn, splitClipAt, selectedClipId, removeClip, undo, redo, captureHistory]);
}

// components/editor/Editor.tsx
import { useShallow as useShallow3 } from "zustand/react/shallow";
import { Fragment as Fragment4, jsx as jsx15, jsxs as jsxs13 } from "react/jsx-runtime";
function Editor() {
  const [activeTool, setActiveTool] = useState3("trim");
  const setCropToolActive = useEditorStore((s) => s.setCropToolActive);
  const { status: exportStatus, progress: exportProgress, outputUrl } = useEditorStore(
    useShallow3((s) => ({ status: s.status, progress: s.progress, outputUrl: s.outputUrl }))
  );
  const resetExport = useEditorStore((s) => s.resetExport);
  const isExporting = exportStatus === "preparing" || exportStatus === "encoding";
  const isExportDone = exportStatus === "done" && !!outputUrl;
  const showOverlay = isExporting || isExportDone;
  const { importFiles } = useVideoImport();
  const { downloadExport, cancelExport } = useExport();
  useKeyboardShortcuts();
  const handleToolChange = useCallback9((tool) => {
    setActiveTool(tool);
    setCropToolActive(tool === "crop");
  }, [setCropToolActive]);
  const onDragOver = useCallback9((e) => {
    e.preventDefault();
  }, []);
  const onDrop = useCallback9(
    (e) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("video/"));
      if (files.length > 0) importFiles(files);
    },
    [importFiles]
  );
  return /* @__PURE__ */ jsxs13(
    "div",
    {
      className: "relative flex flex-col w-full h-full overflow-hidden rounded-xl",
      style: { background: "#1c1c1c" },
      onDragOver,
      onDrop,
      children: [
        /* @__PURE__ */ jsx15(AnimatePresence, { children: showOverlay && /* @__PURE__ */ jsx15(
          motion3.div,
          {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 },
            className: "absolute inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-black/70 backdrop-blur-sm rounded-xl",
            children: isExportDone ? /* @__PURE__ */ jsxs13(Fragment4, { children: [
              /* @__PURE__ */ jsx15("div", { className: "w-10 h-10 flex items-center justify-center rounded-full bg-emerald-500/20", children: /* @__PURE__ */ jsx15("svg", { className: "w-5 h-5 text-emerald-400", fill: "none", stroke: "currentColor", strokeWidth: 2.5, viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx15("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M5 13l4 4L19 7" }) }) }),
              /* @__PURE__ */ jsx15("p", { className: "text-sm font-semibold text-white", children: "Export complete" }),
              /* @__PURE__ */ jsxs13("div", { className: "flex items-center gap-3 mt-1", children: [
                /* @__PURE__ */ jsx15(
                  "button",
                  {
                    onClick: () => {
                      downloadExport(outputUrl);
                      resetExport();
                    },
                    className: "px-5 h-9 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition-colors",
                    children: "Download"
                  }
                ),
                /* @__PURE__ */ jsx15(
                  "button",
                  {
                    onClick: resetExport,
                    className: "px-5 h-9 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-200 text-sm font-medium transition-colors",
                    children: "Cancel"
                  }
                )
              ] })
            ] }) : /* @__PURE__ */ jsxs13(Fragment4, { children: [
              /* @__PURE__ */ jsx15("p", { className: "text-sm font-semibold text-white", children: "Exporting\u2026" }),
              /* @__PURE__ */ jsx15("div", { className: "w-64 h-1.5 bg-zinc-700 rounded-full overflow-hidden", children: /* @__PURE__ */ jsx15(
                motion3.div,
                {
                  className: "h-full bg-amber-400 rounded-full",
                  animate: { width: `${exportProgress}%` },
                  transition: { duration: 0.3 }
                }
              ) }),
              /* @__PURE__ */ jsxs13("p", { className: "text-xs text-zinc-400 tabular-nums", children: [
                exportProgress,
                "%"
              ] }),
              /* @__PURE__ */ jsx15(
                "button",
                {
                  onClick: cancelExport,
                  className: "mt-1 px-5 h-9 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-200 text-sm font-medium transition-colors",
                  children: "Cancel"
                }
              )
            ] })
          }
        ) }),
        /* @__PURE__ */ jsx15(TopBar, {}),
        /* @__PURE__ */ jsxs13("div", { className: "flex flex-1 overflow-hidden min-h-0", children: [
          /* @__PURE__ */ jsx15(Sidebar, { activeTool, onToolChange: handleToolChange }),
          /* @__PURE__ */ jsxs13("div", { className: "flex flex-col flex-1 overflow-hidden min-w-0", children: [
            /* @__PURE__ */ jsx15(PreviewPanel, { activeTool }),
            /* @__PURE__ */ jsxs13(AnimatePresence, { mode: "wait", initial: false, children: [
              activeTool === "trim" && /* @__PURE__ */ jsx15(
                motion3.div,
                {
                  initial: { opacity: 0, y: 8 },
                  animate: { opacity: 1, y: 0 },
                  exit: { opacity: 0, y: 8 },
                  transition: { duration: 0.15 },
                  children: /* @__PURE__ */ jsx15(TrimPanel, {})
                },
                "trim"
              ),
              activeTool === "finetune" && /* @__PURE__ */ jsx15(
                motion3.div,
                {
                  initial: { opacity: 0, y: 8 },
                  animate: { opacity: 1, y: 0 },
                  exit: { opacity: 0, y: 8 },
                  transition: { duration: 0.15 },
                  children: /* @__PURE__ */ jsx15(FinetunePanel, {})
                },
                "finetune"
              ),
              activeTool === "filter" && /* @__PURE__ */ jsx15(
                motion3.div,
                {
                  initial: { opacity: 0, y: 8 },
                  animate: { opacity: 1, y: 0 },
                  exit: { opacity: 0, y: 8 },
                  transition: { duration: 0.15 },
                  children: /* @__PURE__ */ jsx15(FilterPanel, {})
                },
                "filter"
              ),
              activeTool === "crop" && /* @__PURE__ */ jsx15(
                motion3.div,
                {
                  initial: { opacity: 0, y: 8 },
                  animate: { opacity: 1, y: 0 },
                  exit: { opacity: 0, y: 8 },
                  transition: { duration: 0.15 },
                  children: /* @__PURE__ */ jsx15(CropPanel, {})
                },
                "crop"
              ),
              activeTool === "resize" && /* @__PURE__ */ jsx15(
                motion3.div,
                {
                  initial: { opacity: 0, y: 8 },
                  animate: { opacity: 1, y: 0 },
                  exit: { opacity: 0, y: 8 },
                  transition: { duration: 0.15 },
                  children: /* @__PURE__ */ jsx15(ResizePanel, {})
                },
                "resize"
              ),
              activeTool === "annotate" && /* @__PURE__ */ jsx15(
                motion3.div,
                {
                  initial: { opacity: 0, y: 8 },
                  animate: { opacity: 1, y: 0 },
                  exit: { opacity: 0, y: 8 },
                  transition: { duration: 0.15 },
                  children: /* @__PURE__ */ jsx15(AnnotatePanel, {})
                },
                "annotate"
              ),
              activeTool === "sticker" && /* @__PURE__ */ jsx15(
                motion3.div,
                {
                  initial: { opacity: 0, y: 8 },
                  animate: { opacity: 1, y: 0 },
                  exit: { opacity: 0, y: 8 },
                  transition: { duration: 0.15 },
                  children: /* @__PURE__ */ jsx15(StickerPanel, {})
                },
                "sticker"
              )
            ] })
          ] })
        ] })
      ]
    }
  );
}

// src/KutlassEditor.tsx
import { jsx as jsx16 } from "react/jsx-runtime";
function kutlassEditor({
  className,
  style,
  exportSettings,
  ffmpegPaths,
  onExportComplete
}) {
  useEffect6(() => {
    if (ffmpegPaths) setFFmpegPaths(ffmpegPaths);
  }, [ffmpegPaths]);
  useEffect6(() => {
    if (exportSettings) {
      useEditorStore.getState().updateExportSettings(exportSettings);
    }
  }, [exportSettings]);
  useEffect6(() => {
    if (!onExportComplete) return;
    return useEditorStore.subscribe((state, prev) => {
      if (state.status === "done" && prev.status !== "done" && state.outputUrl) {
        fetch(state.outputUrl).then((r) => r.blob()).then((blob) => onExportComplete(blob)).catch(console.error);
      }
    });
  }, [onExportComplete]);
  return /* @__PURE__ */ jsx16(
    "div",
    {
      className,
      style: __spreadValues({ width: "100%", height: "100%" }, style),
      children: /* @__PURE__ */ jsx16(Editor, {})
    }
  );
}
export {
  kutlassEditor,
  setFFmpegPaths
};
//# sourceMappingURL=index.mjs.map