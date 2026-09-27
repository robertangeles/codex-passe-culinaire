#!/usr/bin/env python3
"""Assemble nine reviewed native motion clips into the 80-second film."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path
from typing import TypedDict


CHAPTER_IDS = (
    "forecast",
    "pantry",
    "preparation",
    "cooking",
    "waste",
    "receiving",
    "team",
    "sales",
    "tomorrow",
)
EXPECTED_FRAMES = (216, 240, 240, 240, 192, 240, 192, 192, 168)
OUTPUT_WIDTH = 960
OUTPUT_HEIGHT = 640
OUTPUT_FPS = 24
OUTPUT_FRAMES = 1920
OUTPUT_SECONDS = 80
MINTERPOLATE = (
    "minterpolate=fps=24:mi_mode=mci:mc_mode=aobmc:me_mode=bidir"
)


class Chapter(TypedDict):
    id: str
    start: int | float
    end: int | float
    frames: int


class SourceRecord(TypedDict):
    id: str
    path: str
    sidecar: str
    sha256: str
    width: int
    height: int
    frames: int
    fps: int
    chapter_start_seconds: int | float
    chapter_end_seconds: int | float
    output_frames: int


class Encoding(TypedDict):
    codec: str
    crf: int
    pixel_format: str
    faststart: bool
    threads: int


class Retiming(TypedDict):
    method: str
    filter: str
    scale: str
    loops: bool
    per_pose_easing: bool


class AssemblyManifest(TypedDict):
    format: str
    timeline_source: str
    duration_seconds: int
    fps: int
    width: int
    height: int
    decoded_frames: int
    audio: str
    encoding: Encoding
    retiming: Retiming
    chapters: list[SourceRecord]
    output_sha256: str
    output_bytes: int


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def ffmpeg_binary() -> str:
    binary = shutil.which("ffmpeg")
    if binary is None:
        raise RuntimeError("FFmpeg is required to assemble and validate the clips")
    return binary


def run(command: list[str], *, capture: bool = False) -> subprocess.CompletedProcess[str]:
    try:
        return subprocess.run(
            command,
            check=True,
            text=True,
            stdout=subprocess.PIPE if capture else subprocess.DEVNULL,
            stderr=subprocess.PIPE,
        )
    except subprocess.CalledProcessError as error:
        detail = (error.stderr or "").strip()
        raise RuntimeError(f"Command failed ({error.returncode}): {detail}") from error


def decoded_video_info(ffmpeg: str, path: Path) -> tuple[int, int, int]:
    """Decode every frame and return its count and the FFmpeg-reported dimensions."""
    result = run(
        [ffmpeg, "-hide_banner", "-loglevel", "error", "-i", str(path),
         "-map", "0:v:0", "-f", "framemd5", "-"],
        capture=True,
    )
    dimension_match = re.search(r"^#dimensions 0: (\d+)x(\d+)$", result.stdout, re.MULTILINE)
    if dimension_match is None:
        raise ValueError(f"FFmpeg could not determine decoded video dimensions: {path}")
    records = [
        line for line in result.stdout.splitlines()
        if line and not line.startswith("#")
    ]
    if not records:
        raise ValueError(f"Video decodes to no frames: {path}")
    return int(dimension_match.group(1)), int(dimension_match.group(2)), len(records)


def load_timeline(script_dir: Path) -> list[Chapter]:
    manifest_path = script_dir / "assets" / "manifest.json"
    try:
        raw: object = json.loads(manifest_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise ValueError(f"Cannot read the kitchen chapter timeline at {manifest_path}") from error
    if not isinstance(raw, dict):
        raise ValueError("The source chapter manifest must be a JSON object")
    if (raw.get("width"), raw.get("height"), raw.get("fps")) != (OUTPUT_WIDTH, OUTPUT_HEIGHT, OUTPUT_FPS):
        raise ValueError("The source chapter manifest dimensions or frame rate changed")
    chapters = raw.get("chapters")
    if not isinstance(chapters, list) or len(chapters) != len(CHAPTER_IDS):
        raise ValueError("The source chapter manifest must contain exactly nine chapters")

    validated: list[Chapter] = []
    previous_end: int | float = 0
    for index, item in enumerate(chapters):
        if not isinstance(item, dict) or item.get("id") != CHAPTER_IDS[index]:
            raise ValueError("The source chapter IDs or order do not match the nine kitchen scenes")
        start, end = item.get("at"), item.get("end")
        if not isinstance(start, (int, float)) or not isinstance(end, (int, float)):
            raise ValueError(f"Invalid chapter bounds for {CHAPTER_IDS[index]}")
        if start != previous_end or end <= start:
            raise ValueError(f"Chapter timeline has a gap, overlap or invalid span at {CHAPTER_IDS[index]}")
        frame_value = (end - start) * OUTPUT_FPS
        if frame_value != EXPECTED_FRAMES[index]:
            raise ValueError(f"Unexpected chapter frame count for {CHAPTER_IDS[index]}: {frame_value}")
        validated.append({"id": CHAPTER_IDS[index], "start": start, "end": end, "frames": EXPECTED_FRAMES[index]})
        previous_end = end
    if previous_end != OUTPUT_SECONDS or sum(item["frames"] for item in validated) != OUTPUT_FRAMES:
        raise ValueError("The source chapter timeline must be contiguous and total exactly 80 seconds")
    return validated


def validate_inputs(input_dir: Path, output_path: Path, chapters: list[Chapter], ffmpeg: str) -> list[SourceRecord]:
    records: list[SourceRecord] = []
    source_paths: set[Path] = set()
    for chapter in chapters:
        chapter_id = chapter["id"]
        clip = (input_dir / f"{chapter_id}.mp4").resolve()
        sidecar = (input_dir / f"{chapter_id}.json").resolve()
        if clip == output_path or sidecar == output_path:
            raise ValueError(f"Output path aliases an input file for {chapter_id}")
        if not clip.is_file() or clip.stat().st_size == 0:
            raise FileNotFoundError(f"Missing or empty native motion clip: {clip}")
        if not sidecar.is_file() or sidecar.stat().st_size == 0:
            raise FileNotFoundError(f"Missing or empty renderer provenance sidecar: {sidecar}")
        try:
            raw_metadata: object = json.loads(sidecar.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as error:
            raise ValueError(f"Invalid renderer provenance JSON: {sidecar}") from error
        if not isinstance(raw_metadata, dict):
            raise ValueError(f"Renderer provenance must be a JSON object: {sidecar}")
        metadata = raw_metadata
        actual_hash = sha256_file(clip)
        if metadata.get("output_sha256") != actual_hash:
            raise ValueError(f"Renderer sidecar hash does not match {clip.name}")
        values = [metadata.get(key) for key in ("width", "height", "frames", "fps")]
        if any(not isinstance(value, int) or value <= 0 for value in values):
            raise ValueError(f"Renderer sidecar has invalid dimensions, frame count or fps for {clip.name}")
        source_width, source_height, source_frames, source_fps = (int(value) for value in values)
        if source_frames < 2:
            raise ValueError(f"Native motion clip must contain at least two frames: {clip.name}")
        width, height, frame_count = decoded_video_info(ffmpeg, clip)
        if (width, height, frame_count) != (source_width, source_height, source_frames):
            raise ValueError(
                f"Decoded clip dimensions/frame count differ from renderer provenance for {clip.name}: "
                f"decoded {width}x{height}, {frame_count} frames; sidecar says "
                f"{source_width}x{source_height}, {source_frames} frames"
            )
        source_paths.update((clip, sidecar))
        records.append({
            "id": chapter_id,
            "path": str(clip),
            "sidecar": str(sidecar),
            "sha256": actual_hash,
            "width": width,
            "height": height,
            "frames": frame_count,
            "fps": source_fps,
            "chapter_start_seconds": chapter["start"],
            "chapter_end_seconds": chapter["end"],
            "output_frames": chapter["frames"],
        })
    if output_path in source_paths or output_path.with_suffix(".json") in source_paths:
        raise ValueError("Output MP4 or manifest path aliases one of the source files")
    return records


def build_filter_graph(records: list[SourceRecord]) -> str:
    filters: list[str] = []
    for index, record in enumerate(records):
        out_frames = record["output_frames"]
        in_frames = record["frames"]
        # Map each source endpoint to its matching output endpoint. This is one
        # linear time transform for the full clip; minterpolate only sees adjacent
        # decoded native frames. Clone padding supplies at most the final frame.
        linear_pts = (
            f"setpts=N*{out_frames - 1}/({in_frames - 1})/{OUTPUT_FPS}/TB"
        )
        # One duplicated source endpoint gives MCI its lookahead at EOF;
        # without it FFmpeg drops the final half of the last source interval.
        # The post-filter clone supplies at most one final output frame.
        filters.append(
            f"[{index}:v]{linear_pts},tpad=stop_mode=clone:stop=1,{MINTERPOLATE},"
            "tpad=stop_mode=clone:stop=1,"
            f"trim=end_frame={out_frames},setpts=N/({OUTPUT_FPS}*TB),"
            f"scale={OUTPUT_WIDTH}:{OUTPUT_HEIGHT}:flags=lanczos,setsar=1,format=yuv420p[v{index}]"
        )
    inputs = "".join(f"[v{index}]" for index in range(len(records)))
    filters.append(f"{inputs}concat=n={len(records)}:v=1:a=0[outv]")
    return ";".join(filters)


def publish(output_temp: Path, manifest_temp: Path, output_path: Path, manifest_path: Path, overwrite: bool, work_dir: Path) -> None:
    destinations = ((output_path, output_temp), (manifest_path, manifest_temp))
    existed = {path: path.exists() for path, _ in destinations}
    if not overwrite and any(existed.values()):
        paths = ", ".join(str(path) for path, exists in existed.items() if exists)
        raise FileExistsError(f"Output already exists: {paths}. Pass --overwrite explicitly.")

    backups: dict[Path, Path] = {}
    staged_ids = {path: (temp.stat().st_dev, temp.stat().st_ino) for path, temp in destinations}
    installed: set[Path] = set()
    try:
        if overwrite:
            for path, exists in existed.items():
                if exists:
                    backup = work_dir / f"backup-{len(backups)}"
                    os.link(path, backup)
                    backups[path] = backup
        for path, temp in destinations:
            if overwrite and existed[path]:
                os.replace(temp, path)
            else:
                # link is exclusive: a file created after the preflight check survives.
                os.link(temp, path)
            installed.add(path)
    except BaseException:
        for path, _ in reversed(destinations):
            if path not in installed:
                continue
            try:
                current = path.stat()
            except FileNotFoundError:
                continue
            if (current.st_dev, current.st_ino) != staged_ids[path]:
                continue
            if path in backups:
                os.replace(backups[path], path)
            else:
                path.unlink()
        raise
    finally:
        for backup in backups.values():
            backup.unlink(missing_ok=True)


def assemble(input_dir: Path, output_path: Path, overwrite: bool) -> AssemblyManifest:
    script_dir = Path(__file__).resolve().parent
    chapters = load_timeline(script_dir)
    input_dir = input_dir.expanduser().resolve()
    output_path = output_path.expanduser().resolve()
    if not input_dir.is_dir():
        raise FileNotFoundError(f"Input directory does not exist: {input_dir}")
    if output_path.suffix.lower() != ".mp4":
        raise ValueError("--output must end in .mp4")
    if not output_path.parent.is_dir():
        raise FileNotFoundError(f"Output directory does not exist: {output_path.parent}")
    protected = {
        (script_dir / "kitchen-day.mp4").resolve(),
        (script_dir / "poster.jpg").resolve(),
    }
    if output_path in protected or output_path.with_suffix(".json") in protected:
        raise ValueError("Assembler cannot overwrite the existing film or poster")
    manifest_path = output_path.with_suffix(".json")
    if not overwrite and (output_path.exists() or manifest_path.exists()):
        raise FileExistsError("Output MP4 or JSON manifest exists. Pass --overwrite explicitly.")

    ffmpeg = ffmpeg_binary()
    records = validate_inputs(input_dir, output_path, chapters, ffmpeg)
    graph = build_filter_graph(records)
    with tempfile.TemporaryDirectory(prefix=".native-film-", dir=output_path.parent) as work:
        work_dir = Path(work)
        encoded = work_dir / "candidate.mp4"
        command = [ffmpeg, "-hide_banner", "-loglevel", "error", "-filter_complex_threads", "2"]
        for record in records:
            command.extend(("-i", record["path"]))
        command.extend((
            "-filter_complex", graph, "-map", "[outv]", "-an", "-threads", "2",
            "-c:v", "libx264", "-preset", "medium", "-crf", "18",
            "-pix_fmt", "yuv420p", "-r", str(OUTPUT_FPS), "-fps_mode", "cfr",
            "-movflags", "+faststart", str(encoded),
        ))
        run(command)
        width, height, frame_count = decoded_video_info(ffmpeg, encoded)
        if (width, height, frame_count) != (OUTPUT_WIDTH, OUTPUT_HEIGHT, OUTPUT_FRAMES):
            raise RuntimeError(
                f"Assembled film failed full decode: got {width}x{height}, {frame_count} frames; "
                f"expected {OUTPUT_WIDTH}x{OUTPUT_HEIGHT}, {OUTPUT_FRAMES} frames"
            )
        final_hash = sha256_file(encoded)
        manifest: AssemblyManifest = {
            "format": "passe-culinaire-native-film-assembly-v1",
            "timeline_source": str((script_dir / "assets" / "manifest.json").resolve()),
            "duration_seconds": OUTPUT_SECONDS,
            "fps": OUTPUT_FPS,
            "width": OUTPUT_WIDTH,
            "height": OUTPUT_HEIGHT,
            "decoded_frames": frame_count,
            "audio": "none",
            "encoding": {"codec": "h264", "crf": 18, "pixel_format": "yuv420p", "faststart": True, "threads": 2},
            "retiming": {
                "method": "linear endpoint-to-endpoint PTS mapping per clip; minterpolate between adjacent native frames; clone only the final endpoint frame if needed",
                "filter": MINTERPOLATE,
                "scale": "960x640 Lanczos",
                "loops": False,
                "per_pose_easing": False,
            },
            "chapters": records,
            "output_sha256": final_hash,
            "output_bytes": encoded.stat().st_size,
        }
        manifest_temp = work_dir / "candidate.json"
        manifest_temp.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        publish(encoded, manifest_temp, output_path, manifest_path, overwrite, work_dir)
    return manifest


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input-dir", type=Path, required=True, help="Directory with nine <chapter>.mp4/.json pairs")
    parser.add_argument("--output", type=Path, required=True, help="Candidate film MP4 path")
    parser.add_argument("--overwrite", action="store_true", help="Explicitly replace candidate MP4 and JSON manifest")
    args = parser.parse_args()
    try:
        manifest = assemble(args.input_dir, args.output, args.overwrite)
    except (FileNotFoundError, FileExistsError, RuntimeError, ValueError, OSError) as error:
        print(f"error: {error}", file=sys.stderr)
        return 2
    print(f"Wrote {args.output.expanduser().resolve()} ({manifest['decoded_frames']} frames, {manifest['output_bytes']} bytes)")
    print(f"Wrote {args.output.expanduser().resolve().with_suffix('.json')}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
