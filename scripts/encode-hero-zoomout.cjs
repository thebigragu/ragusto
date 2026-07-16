#!/usr/bin/env node
/**
 * Full-bleed hero loop from generative-expanded atmosphere plate.
 * Covers the viewport (object-cover style) with mild ambient pan + light breathe.
 */
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const VIDEOS = path.join(ROOT, "public", "videos");
const IMAGES = path.join(ROOT, "public", "images");
fs.mkdirSync(VIDEOS, { recursive: true });
fs.mkdirSync(IMAGES, { recursive: true });

function findFfmpeg() {
  if (process.env.FFMPEG_PATH && fs.existsSync(process.env.FFMPEG_PATH)) return process.env.FFMPEG_PATH;
  const winget = path.join(
    process.env.LOCALAPPDATA || "",
    "Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1.2-full_build/bin/ffmpeg.exe",
  );
  if (fs.existsSync(winget)) return winget;
  return "ffmpeg";
}

const FFMPEG = findFfmpeg();
function run(args) {
  console.log("> ffmpeg", args.slice(0, 6).join(" "), "...");
  const r = spawnSync(FFMPEG, args, { stdio: "inherit" });
  if (r.status !== 0) throw new Error(`ffmpeg exited ${r.status}`);
}

const candidates = [
  path.join(
    process.env.USERPROFILE || "",
    ".cursor/projects/c-Users-jacob-Desktop-Website/assets/hero-theme-wide.png",
  ),
  path.join(
    process.env.USERPROFILE || "",
    ".cursor/projects/c-Users-jacob-Desktop-Website/assets/hero-theme-atmosphere.png",
  ),
  path.join(IMAGES, "hero-theme-atmosphere.jpg"),
];
const stillSrc = candidates.find((p) => fs.existsSync(p));
if (!stillSrc) throw new Error("No hero still found");

const plate = path.join(IMAGES, "hero-theme-atmosphere.jpg");
// Full-frame cover — crop letterbox if present, fill 1920x1080 edge-to-edge
run([
  "-y",
  "-i",
  stillSrc,
  "-vf",
  "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,eq=contrast=1.05:brightness=-0.02:saturation=0.94",
  "-frames:v",
  "1",
  "-update",
  "1",
  "-q:v",
  "2",
  plate,
]);

const basename = "hero-desk-loop";
const raw = path.join(VIDEOS, `_${basename}-raw.mp4`);
const rev = path.join(VIDEOS, `_${basename}-rev.mp4`);
const list = path.join(VIDEOS, `_${basename}-list.txt`);
const mp4 = path.join(VIDEOS, `${basename}.mp4`);
const webm = path.join(VIDEOS, `${basename}.webm`);
const poster = path.join(VIDEOS, `${basename}-poster.jpg`);

// Gentle ambient pan on a full-bleed plate (mild overscan only)
const vf = [
  "scale=2000:1125",
  "crop=1920:1080:x='(iw-ow)/2+48*sin(2*PI*t/9)':y='(ih-oh)/2+24*cos(2*PI*t/11)'",
  "eq=contrast=1.08:brightness='-0.03+0.08*sin(2*PI*t/2.6)':saturation='0.9+0.12*sin(2*PI*t/4)'",
  "vignette=PI/6",
  "noise=alls=10:allf=t+u",
].join(",");

run([
  "-y",
  "-loop",
  "1",
  "-i",
  plate,
  "-vf",
  vf,
  "-t",
  "9",
  "-r",
  "24",
  "-c:v",
  "libx264",
  "-pix_fmt",
  "yuv420p",
  "-an",
  raw,
]);
run(["-y", "-i", raw, "-vf", "reverse", "-an", rev]);

const listBody = `file '${raw.replace(/\\/g, "/")}'\nfile '${rev.replace(/\\/g, "/")}'\n`;
fs.writeFileSync(list, listBody);

run([
  "-y",
  "-f",
  "concat",
  "-safe",
  "0",
  "-i",
  list,
  "-c:v",
  "libx264",
  "-preset",
  "medium",
  "-crf",
  "19",
  "-an",
  "-pix_fmt",
  "yuv420p",
  "-movflags",
  "+faststart",
  mp4,
]);
run(["-y", "-i", mp4, "-c:v", "libvpx-vp9", "-b:v", "2.5M", "-an", "-pix_fmt", "yuv420p", webm]);
run(["-y", "-i", mp4, "-ss", "00:00:02", "-frames:v", "1", "-update", "1", "-q:v", "2", poster]);

for (const f of [raw, rev, list]) {
  try {
    fs.unlinkSync(f);
  } catch {}
}
console.log("Encoded full-bleed", basename, "from", stillSrc);
