#!/usr/bin/env node
/**
 * Full-scene ambient hero loop — visible pan + light breathe + grain.
 * No opaque laptop mask (that caused the "black zoomed void").
 */
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const VIDEOS = path.join(ROOT, "public", "videos");
const ASSETS = path.join(
  process.env.USERPROFILE || "",
  ".cursor/projects/c-Users-jacob-Desktop-Website/assets",
);
fs.mkdirSync(VIDEOS, { recursive: true });

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
  console.log("> ffmpeg", args.slice(0, 8).join(" "), "...");
  const r = spawnSync(FFMPEG, args, { stdio: "inherit" });
  if (r.status !== 0) throw new Error(`ffmpeg ${r.status}`);
}

const candidates = [
  path.join(
    ASSETS,
    "c__Users_jacob_AppData_Roaming_Cursor_User_workspaceStorage_fbb4a02a4a8451690b61791a2f9c7565_images_image-588501cc-e7e4-4ad8-a368-48c1ca67f338.png",
  ),
  path.join(ASSETS, "hero-ref-environment.png"),
  path.join(ROOT, "public/images/hero-ref-full.jpg"),
];
const stillSrc = candidates.find((p) => fs.existsSync(p));
if (!stillSrc) throw new Error("No hero still found");

const plate = path.join(ROOT, "public/images/hero-atmosphere.jpg");
// Soften baked website chrome only — keep plant, desk, books, light fully visible
run([
  "-y",
  "-i",
  stillSrc,
  "-vf",
  "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,drawbox=x=0:y=0:w=1920:h=64:color=black@0.45:t=fill,eq=contrast=1.06:brightness=-0.01:saturation=0.96",
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

// Oversized scale + drifting crop = clear camera drift without hyper-zoom
const vf = [
  "scale=2100:1182",
  "crop=1920:1080:x='(iw-ow)/2+55*sin(2*PI*t/9)':y='(ih-oh)/2+28*cos(2*PI*t/11)'",
  "eq=contrast=1.12:brightness='-0.025+0.045*sin(2*PI*t/3.2)':saturation='0.88+0.12*sin(2*PI*t/4.5)'",
  "vignette=PI/5",
  "noise=alls=14:allf=t+u",
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
  "10",
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
fs.writeFileSync(list, `file '${raw.replace(/\\/g, "/")}'\nfile '${rev.replace(/\\/g, "/")}'\n`);
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
run(["-y", "-i", mp4, "-c:v", "libvpx-vp9", "-b:v", "2.8M", "-an", "-pix_fmt", "yuv420p", webm]);
run(["-y", "-i", mp4, "-ss", "00:00:02.5", "-frames:v", "1", "-update", "1", "-q:v", "2", poster]);

for (const f of [raw, rev, list]) {
  try {
    fs.unlinkSync(f);
  } catch {
    /* ignore */
  }
}
console.log("Ambient hero loop ready — full scene visible");
