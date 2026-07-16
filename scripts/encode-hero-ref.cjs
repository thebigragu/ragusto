#!/usr/bin/env node
/** Encode hero loop from reference-matching environment plate. */
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const VIDEOS = path.join(ROOT, "public", "videos");
const still = path.join(ROOT, "public", "images", "hero-ref-environment.jpg");
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
  const r = spawnSync(FFMPEG, args, { stdio: "inherit" });
  if (r.status !== 0) throw new Error(`ffmpeg ${r.status}`);
}

const basename = "hero-desk-loop";
const frames = 216; // 9s @ 24fps
const raw = path.join(VIDEOS, `_${basename}-raw.mp4`);
const rev = path.join(VIDEOS, `_${basename}-rev.mp4`);
const list = path.join(VIDEOS, `_${basename}-list.txt`);
const mp4 = path.join(VIDEOS, `${basename}.mp4`);
const webm = path.join(VIDEOS, `${basename}.webm`);
const poster = path.join(VIDEOS, `${basename}-poster.jpg`);

// Subtle cinematic: slow push-in + micro pan + gentle exposure breathe + fine grain
const vf = [
  "scale=1920:1080:force_original_aspect_ratio=increase",
  "crop=1920:1080",
  `zoompan=z='1+0.08*on/${frames}':x='iw/2-(iw/zoom/2)+12*sin(2*PI*on/${frames})':y='ih/2-(ih/zoom/2)+6*cos(2*PI*on/${frames})':d=${frames}:s=1920x1080:fps=24`,
  "eq=contrast=1.06:brightness='-0.02+0.015*sin(2*PI*t/5)':saturation=0.94",
  "vignette=PI/5",
  "noise=alls=4:allf=t",
].join(",");

run(["-y", "-loop", "1", "-i", still, "-vf", vf, "-t", "9", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-an", raw]);
run(["-y", "-i", raw, "-vf", "reverse", "-an", rev]);
fs.writeFileSync(list, `file '${raw.replace(/\\/g, "/")}'\nfile '${rev.replace(/\\/g, "/")}'\n`);
run([
  "-y", "-f", "concat", "-safe", "0", "-i", list,
  "-c:v", "libx264", "-preset", "medium", "-crf", "21", "-an", "-pix_fmt", "yuv420p", "-movflags", "+faststart", mp4,
]);
run(["-y", "-i", mp4, "-c:v", "libvpx-vp9", "-b:v", "2.2M", "-an", "-pix_fmt", "yuv420p", webm]);
run(["-y", "-i", mp4, "-ss", "00:00:01.2", "-frames:v", "1", "-update", "1", "-q:v", "2", poster]);
for (const f of [raw, rev, list]) try { fs.unlinkSync(f); } catch {}
console.log("Hero cinematic loop ready");
