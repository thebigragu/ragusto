#!/usr/bin/env node
/**
 * Zoomed-out cinematic hero loop with obvious ambient light breathe.
 * Composites a smaller scene over a blurred plate so the desk doesn't feel macro-zoomed.
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
    ".cursor/projects/c-Users-jacob-Desktop-Website/assets/hero-theme-atmosphere.png",
  ),
  path.join(IMAGES, "hero-theme-atmosphere.jpg"),
];
const stillSrc = candidates.find((p) => fs.existsSync(p));
if (!stillSrc) throw new Error("No hero still found");

const plate = path.join(IMAGES, "hero-theme-atmosphere.jpg");
// Zoom OUT further: blurred full-bleed base + ~58% sharp scene so the room reads wider
run([
  "-y",
  "-i",
  stillSrc,
  "-filter_complex",
  [
    "[0:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,boxblur=32:10,eq=brightness=-0.2:saturation=0.7[bg]",
    "[0:v]scale=1120:748:force_original_aspect_ratio=decrease[fg]",
    "[bg][fg]overlay=(W-w)/2-160:(H-h)/2-30,eq=contrast=1.05:saturation=0.92",
  ].join(";"),
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

// Mild overscan pan + light breathe (avoid re-zooming the plate)
const vf = [
  "scale=2000:1125",
  "crop=1920:1080:x='(iw-ow)/2+55*sin(2*PI*t/8)':y='(ih-oh)/2+28*cos(2*PI*t/10)'",
  "eq=contrast=1.1:brightness='-0.05+0.1*sin(2*PI*t/2.4)':saturation='0.86+0.16*sin(2*PI*t/3.6)'",
  "vignette=PI/5.5",
  "noise=alls=12:allf=t+u",
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
console.log("Encoded", basename);
