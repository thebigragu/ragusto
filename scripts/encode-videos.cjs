#!/usr/bin/env node
/**
 * Encode cinematic loops with FFmpeg.
 *
 * Prefer Blender frame sequences when present; otherwise build Ken-Burns
 * cinematic loops from studio stills (unique grade/motion per plate).
 *
 * Usage: node scripts/encode-videos.cjs
 */
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const VIDEOS = path.join(ROOT, "public", "videos");
const IMAGES = path.join(ROOT, "public", "images");

fs.mkdirSync(VIDEOS, { recursive: true });

function findFfmpeg() {
  const fromEnv = process.env.FFMPEG_PATH;
  if (fromEnv && fs.existsSync(fromEnv)) return fromEnv;
  const which = spawnSync("where", ["ffmpeg"], { encoding: "utf8", shell: true });
  if (which.status === 0) {
    const line = which.stdout.split(/\r?\n/).find(Boolean);
    if (line) return line.trim();
  }
  const wingetGuess = path.join(
    process.env.LOCALAPPDATA || "",
    "Microsoft",
    "WinGet",
    "Packages",
  );
  if (fs.existsSync(wingetGuess)) {
    const walk = (dir, depth = 0) => {
      if (depth > 4) return null;
      for (const name of fs.readdirSync(dir)) {
        const p = path.join(dir, name);
        try {
          const st = fs.statSync(p);
          if (st.isDirectory()) {
            const found = walk(p, depth + 1);
            if (found) return found;
          } else if (name.toLowerCase() === "ffmpeg.exe") {
            return p;
          }
        } catch {
          /* ignore */
        }
      }
      return null;
    };
    const found = walk(wingetGuess);
    if (found) return found;
  }
  return "ffmpeg";
}

const FFMPEG = findFfmpeg();

function run(args) {
  console.log(`> ffmpeg ${args.join(" ")}`);
  const r = spawnSync(FFMPEG, args, { stdio: "inherit", shell: false });
  if (r.status !== 0) {
    throw new Error(`ffmpeg failed with code ${r.status}`);
  }
}

function hasFrames(dir) {
  if (!fs.existsSync(dir)) return false;
  return fs.readdirSync(dir).some((f) => f.endsWith(".png"));
}

function encodeFromFrames(frameDir, basename) {
  const pattern = path.join(frameDir, "frame_%04d.png");
  const webm = path.join(VIDEOS, `${basename}.webm`);
  const mp4 = path.join(VIDEOS, `${basename}.mp4`);
  const poster = path.join(VIDEOS, `${basename}-poster.jpg`);

  run([
    "-y",
    "-framerate",
    "24",
    "-i",
    pattern,
    "-c:v",
    "libvpx-vp9",
    "-b:v",
    "1.8M",
    "-an",
    "-pix_fmt",
    "yuv420p",
    webm,
  ]);
  run([
    "-y",
    "-framerate",
    "24",
    "-i",
    pattern,
    "-c:v",
    "libx264",
    "-preset",
    "slow",
    "-crf",
    "22",
    "-an",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
    mp4,
  ]);
  run(["-y", "-i", mp4, "-ss", "00:00:01", "-vframes", "1", "-q:v", "3", poster]);
}

/**
 * Cinematic Ken-Burns loop from a still — unique zoom/pan/grade per plate.
 * Creates a seamless-feeling 7–8s loop via ping-pong reverse concat.
 */
function encodeFromStill(stillPath, basename, opts) {
  const {
    duration = 7,
    zoomEnd = 1.12,
    x = "iw/2",
    y = "ih/2",
    eq = "contrast=1.08:brightness=-0.04:saturation=0.92",
  } = opts;

  const raw = path.join(VIDEOS, `_${basename}-raw.mp4`);
  const webm = path.join(VIDEOS, `${basename}.webm`);
  const mp4 = path.join(VIDEOS, `${basename}.mp4`);
  const poster = path.join(VIDEOS, `${basename}-poster.jpg`);

  // Slow zoom toward desk / atrium focal region
  const zExpr = `min(zoom+0.00035,${zoomEnd})`;
  const vf = [
    `scale=1920:1080:force_original_aspect_ratio=increase`,
    `crop=1920:1080`,
    `zoompan=z='${zExpr}':x='${x}-(iw/zoom/2)':y='${y}-(ih/zoom/2)':d=${Math.round(duration * 24)}:s=1920x1080:fps=24`,
    `eq=${eq}`,
    `vignette=PI/5`,
  ].join(",");

  run([
    "-y",
    "-loop",
    "1",
    "-i",
    stillPath,
    "-vf",
    vf,
    "-t",
    String(duration),
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-an",
    raw,
  ]);

  // Ping-pong for seamless loop
  const listFile = path.join(VIDEOS, `_${basename}-list.txt`);
  const rev = path.join(VIDEOS, `_${basename}-rev.mp4`);
  run(["-y", "-i", raw, "-vf", "reverse", "-an", rev]);
  fs.writeFileSync(
    listFile,
    `file '${raw.replace(/\\/g, "/")}'\nfile '${rev.replace(/\\/g, "/")}'\n`,
  );
  run([
    "-y",
    "-f",
    "concat",
    "-safe",
    "0",
    "-i",
    listFile,
    "-c:v",
    "libx264",
    "-preset",
    "slow",
    "-crf",
    "23",
    "-an",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
    mp4,
  ]);
  run([
    "-y",
    "-i",
    mp4,
    "-c:v",
    "libvpx-vp9",
    "-b:v",
    "1.6M",
    "-an",
    "-pix_fmt",
    "yuv420p",
    webm,
  ]);
  run(["-y", "-i", mp4, "-ss", "00:00:00.5", "-vframes", "1", "-q:v", "3", poster]);

  for (const f of [raw, rev, listFile]) {
    try {
      fs.unlinkSync(f);
    } catch {
      /* ignore */
    }
  }
}

const heroFrames = path.join(ROOT, "blender", "output", "hero-desk");
const atriumFrames = path.join(ROOT, "blender", "output", "process-atrium");

if (hasFrames(heroFrames)) {
  encodeFromFrames(heroFrames, "hero-desk-loop");
} else {
  encodeFromStill(path.join(IMAGES, "hero-studio-plate.jpg"), "hero-desk-loop", {
    duration: 7,
    zoomEnd: 1.14,
    x: "iw*0.58",
    y: "ih*0.52",
    eq: "contrast=1.1:brightness=-0.05:saturation=0.88",
  });
}

if (hasFrames(atriumFrames)) {
  encodeFromFrames(atriumFrames, "process-atrium-loop");
} else {
  encodeFromStill(path.join(IMAGES, "studio-atrium.jpg"), "process-atrium-loop", {
    duration: 8,
    zoomEnd: 1.1,
    x: "iw*0.62",
    y: "ih*0.45",
    eq: "contrast=1.06:brightness=-0.03:saturation=0.95:gamma=0.95",
  });
}

// CTA atmosphere — unique crop/grade of atrium still
encodeFromStill(path.join(IMAGES, "studio-bench.jpg"), "cta-atmosphere-loop", {
  duration: 6,
  zoomEnd: 1.08,
  x: "iw*0.5",
  y: "ih*0.48",
  eq: "contrast=1.12:brightness=-0.08:saturation=0.75",
});

console.log("Videos written to", VIDEOS);
