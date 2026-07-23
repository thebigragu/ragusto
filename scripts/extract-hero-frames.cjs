#!/usr/bin/env node
/**
 * Extract scroll-scrub WebP frame sequences from hero MP4s.
 * Run: npm run hero:frames
 */
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const VIDEOS = path.join(ROOT, "public", "videos");
const OUT = path.join(ROOT, "public", "hero-sequences");

const VARIANTS = [
  {
    id: "desktop",
    source: path.join(VIDEOS, "hero-kling.mp4"),
    outDir: path.join(OUT, "desktop"),
    scale: "1920:-2",
    frameCount: 240,
    fps: 24,
    quality: 82,
  },
  {
    id: "mobile",
    source: path.join(VIDEOS, "hero-kling-mobile.mp4"),
    outDir: path.join(OUT, "mobile"),
    scale: "1080:-2",
    frameCount: 240,
    fps: 24,
    quality: 82,
  },
];

function findBin(name) {
  const envKey = name === "ffmpeg" ? "FFMPEG_PATH" : "FFPROBE_PATH";
  if (process.env[envKey] && fs.existsSync(process.env[envKey])) return process.env[envKey];
  const winget = path.join(
    process.env.LOCALAPPDATA || "",
    "Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1.2-full_build/bin",
    `${name}.exe`,
  );
  if (fs.existsSync(winget)) return winget;
  return name;
}

const FFMPEG = findBin("ffmpeg");
const FFPROBE = findBin("ffprobe");

function run(args, label) {
  const r = spawnSync(FFMPEG, args, { stdio: "inherit" });
  if (r.status !== 0) throw new Error(`${label} failed (exit ${r.status})`);
}

function probe(file) {
  const r = spawnSync(
    FFPROBE,
    [
      "-v",
      "error",
      "-select_streams",
      "v:0",
      "-show_entries",
      "stream=width,height,duration,nb_frames",
      "-of",
      "json",
      file,
    ],
    { encoding: "utf8" },
  );
  if (r.status !== 0) throw new Error(`ffprobe failed for ${file}`);
  const json = JSON.parse(r.stdout);
  const s = json.streams?.[0] || {};
  return {
    width: Number(s.width) || 0,
    height: Number(s.height) || 0,
    duration: Number(s.duration) || 0,
    nbFrames: Number(s.nb_frames) || 0,
  };
}

function dirSizeBytes(dir) {
  let total = 0;
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isFile()) total += fs.statSync(p).size;
  }
  return total;
}

function formatMb(bytes) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function extractVariant(v) {
  if (!fs.existsSync(v.source)) {
    throw new Error(`Missing source: ${v.source}`);
  }

  fs.mkdirSync(v.outDir, { recursive: true });

  // Clear old frames
  for (const f of fs.readdirSync(v.outDir)) {
    if (f.startsWith("frame-") && f.endsWith(".webp")) {
      fs.unlinkSync(path.join(v.outDir, f));
    }
  }

  const meta = probe(v.source);
  const outPattern = path.join(v.outDir, "frame-%05d.webp");

  console.log(`\n=== ${v.id} ===`);
  console.log(`Source: ${v.source} (${meta.width}x${meta.height}, ${meta.duration.toFixed(2)}s)`);

  run(
    [
      "-y",
      "-i",
      v.source,
      "-vf",
      `fps=${v.fps},scale=${v.scale}:flags=lanczos`,
      "-frames:v",
      String(v.frameCount),
      "-c:v",
      "libwebp",
      "-quality",
      String(v.quality),
      "-compression_level",
      "6",
      "-preset",
      "picture",
      outPattern,
    ],
    `${v.id} extract`,
  );

  const frames = fs
    .readdirSync(v.outDir)
    .filter((f) => f.startsWith("frame-") && f.endsWith(".webp"))
    .sort();

  if (frames.length === 0) throw new Error(`No frames written to ${v.outDir}`);

  // Probe first frame dimensions
  const firstFrame = path.join(v.outDir, frames[0]);
  const frameMeta = probe(firstFrame);

  const manifest = {
    id: v.id,
    source: `public/videos/${path.basename(v.source)}`,
    frameCount: frames.length,
    width: frameMeta.width,
    height: frameMeta.height,
    fps: v.fps,
    pattern: `/hero-sequences/${v.id}/frame-%05d.webp`,
  };

  fs.writeFileSync(path.join(v.outDir, "manifest.json"), JSON.stringify(manifest, null, 2));

  const size = dirSizeBytes(v.outDir);
  console.log(`Wrote ${frames.length} frames → ${v.outDir}`);
  console.log(`Output size: ${formatMb(size)}`);
  console.log(`Manifest: ${JSON.stringify(manifest)}`);
}

function main() {
  console.log(`ffmpeg: ${FFMPEG}`);
  console.log(`ffprobe: ${FFPROBE}`);
  fs.mkdirSync(OUT, { recursive: true });

  for (const v of VARIANTS) {
    extractVariant(v);
  }

  const total = dirSizeBytes(OUT);
  console.log(`\nDone. Total hero-sequences size: ${formatMb(total)}`);
}

main();
