#!/usr/bin/env node
/**
 * Encode DISTINCT cinematic loops from new concept plates.
 * Stronger visible motion than subtle Ken Burns so video is obvious.
 */
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const VIDEOS = path.join(ROOT, "public", "videos");
const IMAGES = path.join(ROOT, "public", "images");
fs.mkdirSync(VIDEOS, { recursive: true });

function findFfmpeg() {
  if (process.env.FFMPEG_PATH && fs.existsSync(process.env.FFMPEG_PATH)) {
    return process.env.FFMPEG_PATH;
  }
  const which = spawnSync("where", ["ffmpeg"], { encoding: "utf8", shell: true });
  if (which.status === 0) {
    const line = which.stdout.split(/\r?\n/).find(Boolean);
    if (line) return line.trim();
  }
  const winget = path.join(
    process.env.LOCALAPPDATA || "",
    "Microsoft",
    "WinGet",
    "Packages",
    "Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe",
    "ffmpeg-8.1.2-full_build",
    "bin",
    "ffmpeg.exe",
  );
  if (fs.existsSync(winget)) return winget;
  return "ffmpeg";
}

const FFMPEG = findFfmpeg();

function run(args) {
  console.log(`> ffmpeg ${args.slice(0, 8).join(" ")} ...`);
  const r = spawnSync(FFMPEG, args, { stdio: "inherit" });
  if (r.status !== 0) throw new Error(`ffmpeg exit ${r.status}`);
}

function encodeCinematic(still, basename, opts) {
  const {
    duration = 8,
    zoomEnd = 1.22,
    x = "iw*0.55",
    y = "ih*0.48",
  } = opts;

  const frames = Math.round(duration * 24);
  const raw = path.join(VIDEOS, `_${basename}-raw.mp4`);
  const rev = path.join(VIDEOS, `_${basename}-rev.mp4`);
  const listFile = path.join(VIDEOS, `_${basename}-list.txt`);
  const mp4 = path.join(VIDEOS, `${basename}.mp4`);
  const webm = path.join(VIDEOS, `${basename}.webm`);
  const poster = path.join(VIDEOS, `${basename}-poster.jpg`);

  // Visible camera push + breathing exposure + film grain so motion is unmistakable
  const vf = [
    `scale=1920:1080:force_original_aspect_ratio=increase`,
    `crop=1920:1080`,
    `zoompan=z='1+${(zoomEnd - 1).toFixed(4)}*on/${frames}':x='${x}-(iw/zoom/2)':y='${y}-(ih/zoom/2)':d=${frames}:s=1920x1080:fps=24`,
    `eq=contrast=1.12:brightness='-0.04+0.03*sin(2*PI*t/4)':saturation=0.9`,
    `vignette=PI/4`,
    `noise=alls=6:allf=t`,
  ].join(",");

  run([
    "-y",
    "-loop",
    "1",
    "-i",
    still,
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
    "medium",
    "-crf",
    "22",
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
    "2M",
    "-an",
    "-pix_fmt",
    "yuv420p",
    webm,
  ]);

  run(["-y", "-i", mp4, "-ss", "00:00:01", "-frames:v", "1", "-update", "1", "-q:v", "3", poster]);

  for (const f of [raw, rev, listFile]) {
    try {
      fs.unlinkSync(f);
    } catch {
      /* ignore */
    }
  }
  console.log("Wrote", basename);
}

encodeCinematic(path.join(IMAGES, "hero-desk-cinematic.jpg"), "hero-desk-loop", {
  duration: 8,
  zoomEnd: 1.24,
  x: "iw*0.58",
  y: "ih*0.5",
});

encodeCinematic(path.join(IMAGES, "process-atrium-cinematic.jpg"), "process-atrium-loop", {
  duration: 9,
  zoomEnd: 1.18,
  x: "iw*0.55",
  y: "ih*0.42",
});

encodeCinematic(path.join(IMAGES, "cta-bench-cinematic.jpg"), "cta-atmosphere-loop", {
  duration: 7,
  zoomEnd: 1.16,
  x: "iw*0.5",
  y: "ih*0.5",
});

console.log("Done — new cinematic loops in", VIDEOS);
