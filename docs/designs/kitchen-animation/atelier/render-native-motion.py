#!/usr/bin/env python3
"""Render one locally authored Wan image-to-video motion test."""

from __future__ import annotations

import argparse
import gc
import hashlib
import json
import os
import shlex
import shutil
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from types import ModuleType
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    import numpy as np
    import torch
    from PIL import Image

MODEL_REVISION = "b8fff7315c768468a5333511427288870b2e9635"
MODEL_REPOSITORY = "Wan-AI/Wan2.2-TI2V-5B-Diffusers"
NEGATIVE_PROMPT = (
    "flicker, jitter, stutter, abrupt pose changes, changing clothes, changing face, "
    "extra fingers, fused fingers, malformed hands, hands passing through objects, "
    "floating utensils, duplicated objects, warped tablet, text, subtitles, camera shake, "
    "camera movement, zoom, cut, dissolve, low detail, blur, plastic skin, robotic movement"
)
MAX_SEQUENCE_LENGTH = 256
MIN_FREE_VRAM_BYTES = 22 * 1024**3
GPU_RESERVE_BYTES = 2 * 1024**3
MAX_CGROUP_MEMORY_BYTES = 14 * 1024**3
MAX_CGROUP_SWAP_BYTES = 1 * 1024**3


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def sha256_text(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def default_model_dir() -> Path:
    return Path(__file__).resolve().parents[4] / ".local" / "video-models" / "wan22-5b"


def systemd_scope_command(arguments: list[str] | None = None) -> str:
    if arguments is None:
        arguments = sys.argv[1:]
    command = [
        "systemd-run",
        "--user",
        "--wait",
        "--pipe",
        "--collect",
        "-p",
        "MemoryMax=14G",
        "-p",
        "MemorySwapMax=1G",
        "-p",
        "OOMPolicy=stop",
        f"--working-directory={Path.cwd()}",
        "--",
        sys.executable,
        str(Path(__file__).resolve()),
        *arguments,
    ]
    return shlex.join(command)


def check_cgroup_limits(
    proc_cgroup_path: Path = Path("/proc/self/cgroup"),
    cgroup_root: Path = Path("/sys/fs/cgroup"),
    arguments: list[str] | None = None,
) -> tuple[int, int]:
    guidance = systemd_scope_command(arguments)
    try:
        cgroup_path = next(
            entry.split(":", 2)[2]
            for entry in proc_cgroup_path.read_text(encoding="utf-8").splitlines()
            if entry.startswith("0::")
        )
    except (OSError, StopIteration) as error:
        raise RuntimeError(
            "Cannot establish the renderer's cgroup v2 memory limits. "
            f"Run it with: {guidance}"
        ) from error

    relative = Path(cgroup_path.lstrip("/"))
    if ".." in relative.parts:
        raise RuntimeError(f"Unsafe cgroup path {cgroup_path!r}. Run it with: {guidance}")
    root = cgroup_root.resolve()
    directory = (root / relative).resolve()
    try:
        directory.relative_to(root)
    except ValueError as error:
        raise RuntimeError(f"Cgroup path escapes the mounted v2 hierarchy. Run it with: {guidance}") from error

    def read_finite_limit(name: str, maximum: int) -> int:
        path = directory / name
        try:
            raw = path.read_text(encoding="ascii").strip()
            value = int(raw) if raw != "max" else None
        except (OSError, ValueError) as error:
            raise RuntimeError(
                f"Cannot read a finite {name} limit for this process. Run it with: {guidance}"
            ) from error
        if value is None or value > maximum:
            shown = "unlimited" if value is None else f"{value / 1024**3:.2f} GiB"
            bound = f"{maximum / 1024**3:.0f} GiB"
            raise RuntimeError(
                f"Current {name} is {shown}; the renderer requires a finite limit no greater than {bound}. "
                f"Run it with: {guidance}"
            )
        return value

    memory_limit = read_finite_limit("memory.max", MAX_CGROUP_MEMORY_BYTES)
    swap_limit = read_finite_limit("memory.swap.max", MAX_CGROUP_SWAP_BYTES)
    return memory_limit, swap_limit


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Create one local Wan 2.2 image-to-video scene for motion review. "
            "This authoring script never downloads models or edits the website preview."
        )
    )
    parser.add_argument("--image", required=True, type=Path, help="Starting frame image")
    parser.add_argument("--prompt-file", required=True, type=Path, help="UTF-8 motion prompt")
    parser.add_argument("--output", required=True, type=Path, help="New MP4 output path")
    parser.add_argument("--model-dir", type=Path, default=default_model_dir(), help="Persistent local model directory")
    parser.add_argument("--width", type=int, default=768)
    parser.add_argument("--height", type=int, default=512)
    parser.add_argument("--frames", type=int, default=81)
    parser.add_argument("--steps", type=int, default=40)
    parser.add_argument("--seed", type=int, default=17)
    parser.add_argument("--fps", type=int, default=24)
    parser.add_argument("--overwrite", action="store_true", help="Replace the explicit output after a successful render")
    parser.add_argument("--resume-latents", action="store_true", help="Resume decoding from a matching saved latent checkpoint")
    return parser.parse_args()


def validate(args: argparse.Namespace) -> tuple[Path, Path, Path, str]:
    image_path = args.image.expanduser().resolve()
    prompt_path = args.prompt_file.expanduser().resolve()
    model_dir = args.model_dir.expanduser().resolve()
    output_path = args.output.expanduser().resolve()

    if not image_path.is_file():
        raise ValueError(f"Starting image does not exist: {image_path}")
    if not prompt_path.is_file():
        raise ValueError(f"Prompt file does not exist: {prompt_path}")
    if not model_dir.is_dir():
        raise ValueError(f"Local model directory does not exist: {model_dir}. Download and verify it separately first.")
    if output_path.suffix.lower() != ".mp4":
        raise ValueError("--output must end in .mp4")
    protected_outputs = {
        (Path(__file__).parent / "kitchen-day.mp4").resolve(),
        (Path(__file__).parent / "poster.jpg").resolve(),
    }
    if output_path in protected_outputs:
        raise ValueError("This authoring script cannot overwrite the existing film or poster")
    if output_path.exists() and not args.overwrite:
        raise FileExistsError(f"Output already exists: {output_path}. Choose another path or pass --overwrite.")
    latent_path = output_path.with_suffix(".latents.pt")
    if latent_path.exists() and not args.resume_latents and not args.overwrite:
        raise FileExistsError(f"Latent checkpoint already exists: {latent_path}. Pass --resume-latents or --overwrite.")
    if args.resume_latents and not latent_path.is_file():
        raise FileNotFoundError(f"Latent checkpoint does not exist: {latent_path}")
    sidecar_path = output_path.with_suffix(".json")
    if sidecar_path.exists() and not args.overwrite:
        raise FileExistsError(f"Reproduction sidecar already exists: {sidecar_path}. Choose another path or pass --overwrite.")
    if not output_path.parent.is_dir():
        raise ValueError(f"Output directory does not exist: {output_path.parent}")
    if args.width < 256 or args.height < 256 or args.width % 32 or args.height % 32:
        raise ValueError("Width and height must each be at least 256 and divisible by 32")
    if args.frames < 5 or (args.frames - 1) % 4:
        raise ValueError("Frame count must be at least 5 and follow Wan's 4n+1 frame pattern")
    if args.steps < 1 or args.fps < 1:
        raise ValueError("Steps and fps must be positive integers")

    prompt = prompt_path.read_text(encoding="utf-8").strip()
    if not prompt:
        raise ValueError("Prompt file is empty")
    return image_path, prompt_path, output_path, prompt


def check_model_files(model_dir: Path) -> str:
    required = [
        model_dir / "tokenizer" / "tokenizer.json",
        model_dir / "text_encoder" / "config.json",
        model_dir / "transformer" / "config.json",
        model_dir / "vae" / "config.json",
        model_dir / "scheduler" / "scheduler_config.json",
    ]
    missing = [str(path) for path in required if not path.is_file()]
    if missing:
        raise FileNotFoundError(
            "The local model is incomplete. Missing files:\n  " + "\n  ".join(missing)
        )

    selected = list(required)
    for name in ("tokenizer_config.json", "special_tokens_map.json", "spiece.model"):
        candidate = model_dir / "tokenizer" / name
        if candidate.is_file():
            selected.append(candidate)

    for component in ("text_encoder", "transformer", "vae"):
        directory = model_dir / component
        indexes = [
            directory / "model.safetensors.index.json",
            directory / "diffusion_pytorch_model.safetensors.index.json",
        ]
        index_path = next((candidate for candidate in indexes if candidate.is_file()), None)
        if index_path is not None:
            selected.append(index_path)
            try:
                weight_names = sorted(set(json.loads(index_path.read_text(encoding="utf-8"))["weight_map"].values()))
            except (KeyError, json.JSONDecodeError) as error:
                raise ValueError(f"Invalid weight index: {index_path}") from error
            for weight_name in weight_names:
                weight_path = directory / weight_name
                if not weight_path.is_file():
                    raise FileNotFoundError(f"Model weight shard is missing: {weight_path}")
                selected.append(weight_path)
        else:
            weights = [
                directory / "diffusion_pytorch_model.safetensors",
                directory / "model.safetensors",
                directory / "pytorch_model.bin",
            ]
            weight_path = next((candidate for candidate in weights if candidate.is_file()), None)
            if weight_path is None:
                raise FileNotFoundError(f"No complete model weights found in {directory}")
            selected.append(weight_path)

    metadata_root = model_dir / ".cache" / "huggingface" / "download"
    for path in selected:
        relative_path = path.relative_to(model_dir)
        metadata_path = metadata_root / f"{relative_path}.metadata"
        if not metadata_path.is_file():
            raise ValueError(
                f"Cannot verify model provenance: missing Hugging Face download metadata for {relative_path}."
            )
        with metadata_path.open(encoding="utf-8") as metadata_file:
            downloaded_revision = metadata_file.readline().strip()
        if downloaded_revision != MODEL_REVISION:
            raise ValueError(
                f"Model provenance mismatch for {relative_path}: expected revision {MODEL_REVISION}, "
                f"found {downloaded_revision or 'no revision'}."
            )
    return MODEL_REVISION


def check_ffmpeg() -> str:
    binary = shutil.which("ffmpeg")
    if binary is None:
        raise RuntimeError("ffmpeg is required to encode the generated frames")
    return binary


def ensure_gpu_memory(torch: ModuleType) -> tuple[int, int, float]:
    if not torch.cuda.is_available():
        raise RuntimeError("Wan rendering requires a supported CUDA or ROCm device exposed as torch.cuda")
    free_bytes, total_bytes = torch.cuda.mem_get_info()
    if free_bytes < MIN_FREE_VRAM_BYTES:
        raise RuntimeError(
            "Insufficient free GPU memory for the full Wan renderer. Need at least "
            f"{MIN_FREE_VRAM_BYTES / 1024**3:.1f} GiB free; "
            f"found {free_bytes / 1024**3:.1f} GiB of {total_bytes / 1024**3:.1f} GiB. "
            "Wait for other GPU workloads to release memory, then retry."
        )
    process_limit = min(0.92, (free_bytes - GPU_RESERVE_BYTES) / total_bytes)
    torch.cuda.set_per_process_memory_fraction(process_limit)
    return free_bytes, total_bytes, process_limit


def embedding_cache_path(output_path: Path, cache_key: str) -> Path:
    return output_path.with_name(f".{output_path.stem}.prompt-{cache_key[:16]}.pt")


def get_prompt_embeddings(
    *,
    torch: ModuleType,
    model_dir: Path,
    output_path: Path,
    prompt: str,
    negative_prompt: str,
    model_revision: str,
) -> tuple[torch.Tensor, torch.Tensor, Path, str]:
    cache_identity = {
        "model_revision": model_revision,
        "prompt": prompt,
        "negative_prompt": negative_prompt,
        "sequence_length": MAX_SEQUENCE_LENGTH,
        "dtype": "bfloat16",
        "device": "cuda",
    }
    cache_hash = sha256_text(json.dumps(cache_identity, ensure_ascii=False, sort_keys=True))
    cache_path = embedding_cache_path(output_path, cache_hash)
    if cache_path.is_file():
        cached = torch.load(cache_path, map_location="cpu", weights_only=True)
        if (
            isinstance(cached, dict)
            and cached.get("cache_hash") == cache_hash
            and isinstance(cached.get("prompt_embeds"), torch.Tensor)
            and isinstance(cached.get("negative_prompt_embeds"), torch.Tensor)
        ):
            return cached["prompt_embeds"], cached["negative_prompt_embeds"], cache_path, cache_hash

    from diffusers.pipelines.wan.pipeline_wan_i2v import prompt_clean
    from transformers import T5TokenizerFast, UMT5EncoderModel

    tokenizer = T5TokenizerFast.from_pretrained(
        model_dir / "tokenizer", local_files_only=True
    )
    encoder_options = {
        "torch_dtype": torch.bfloat16,
        "low_cpu_mem_usage": True,
        "local_files_only": True,
    }
    encoder_options["device_map"] = "cuda"
    encoder = UMT5EncoderModel.from_pretrained(model_dir / "text_encoder", **encoder_options)
    text_device = "cuda"
    encoder.eval()

    def encode(text: str) -> torch.Tensor:
        text_inputs = tokenizer(
            [prompt_clean(text)],
            padding="max_length",
            max_length=MAX_SEQUENCE_LENGTH,
            truncation=True,
            add_special_tokens=True,
            return_attention_mask=True,
            return_tensors="pt",
        )
        input_ids = text_inputs.input_ids.to(text_device)
        attention_mask = text_inputs.attention_mask.to(text_device)
        sequence_length = int(attention_mask.gt(0).sum(dim=1).long()[0].item())
        with torch.inference_mode():
            encoded = encoder(input_ids, attention_mask).last_hidden_state.to(
                dtype=torch.bfloat16, device=text_device
            )
        trimmed = encoded[0, :sequence_length]
        padded = torch.cat(
            [trimmed, trimmed.new_zeros(MAX_SEQUENCE_LENGTH - sequence_length, trimmed.shape[-1])],
            dim=0,
        )
        return padded.unsqueeze(0).to(device="cpu").contiguous()

    prompt_embeds = encode(prompt)
    negative_prompt_embeds = encode(negative_prompt)
    del encoder, tokenizer
    gc.collect()
    if torch.cuda.is_available():
        torch.cuda.empty_cache()

    cache_path.parent.mkdir(parents=True, exist_ok=True)
    temporary_cache = cache_path.with_name(cache_path.name + f".{os.getpid()}.tmp")
    try:
        torch.save(
            {
                "cache_hash": cache_hash,
                "prompt_embeds": prompt_embeds,
                "negative_prompt_embeds": negative_prompt_embeds,
            },
            temporary_cache,
        )
        os.replace(temporary_cache, cache_path)
    finally:
        temporary_cache.unlink(missing_ok=True)
    return prompt_embeds, negative_prompt_embeds, cache_path, cache_hash


def latent_checkpoint_path(output_path: Path) -> Path:
    return output_path.with_suffix(".latents.pt")


def latent_identity(
    *,
    image_path: Path,
    prompt: str,
    model_revision: str,
    args: argparse.Namespace,
) -> dict[str, object]:
    return {
        "model_repository": MODEL_REPOSITORY,
        "model_revision": model_revision,
        "image_sha256": sha256_file(image_path),
        "prompt_sha256": sha256_text(prompt),
        "negative_prompt_sha256": sha256_text(NEGATIVE_PROMPT),
        "seed": args.seed,
        "width": args.width,
        "height": args.height,
        "frames": args.frames,
        "steps": args.steps,
        "guidance_scale": 5.0,
        "scheduler": "UniPCMultistepScheduler",
    }


def identity_digest(identity: dict[str, object]) -> str:
    return sha256_text(json.dumps(identity, sort_keys=True, separators=(",", ":")))


def save_latent_checkpoint(torch: ModuleType, path: Path, latents: torch.Tensor, identity: dict[str, object]) -> str:
    checkpoint_hash = identity_digest(identity)
    temporary = path.with_name(path.name + f".{os.getpid()}.tmp")
    try:
        torch.save(
            {
                "identity": identity,
                "identity_sha256": checkpoint_hash,
                "latents": latents.detach().to(device="cpu").contiguous(),
            },
            temporary,
        )
        os.replace(temporary, path)
    finally:
        temporary.unlink(missing_ok=True)
    return checkpoint_hash


def expected_latent_shape(model_dir: Path, args: argparse.Namespace) -> tuple[int, int, int, int, int]:
    config = json.loads((model_dir / "vae" / "config.json").read_text())
    channels, temporal, spatial = (config[key] for key in ("z_dim", "scale_factor_temporal", "scale_factor_spatial"))
    if any(not isinstance(value, int) or value <= 0 for value in (channels, temporal, spatial)):
        raise ValueError("Invalid latent dimensions in the verified VAE configuration")
    return (1, channels, (args.frames - 1) // temporal + 1, args.height // spatial, args.width // spatial)


def validate_latents(torch: ModuleType, latents: torch.Tensor, expected_shape: tuple[int, ...]) -> None:
    if not isinstance(latents, torch.Tensor) or tuple(latents.shape) != expected_shape:
        raise ValueError(f"Latent checkpoint must have exact shape {expected_shape}")
    if not torch.is_floating_point(latents) or not torch.isfinite(latents).all().item():
        raise ValueError("Latent checkpoint must contain finite floating-point values")


def load_latent_checkpoint(torch: ModuleType, path: Path, expected_identity: dict[str, object], expected_shape: tuple[int, ...]) -> torch.Tensor:
    checkpoint = torch.load(path, map_location="cpu", weights_only=True)
    expected_digest = identity_digest(expected_identity)
    if (
        not isinstance(checkpoint, dict)
        or checkpoint.get("identity") != expected_identity
        or checkpoint.get("identity_sha256") != expected_digest
        or not isinstance(checkpoint.get("latents"), torch.Tensor)
    ):
        raise ValueError(
            f"Latent checkpoint does not match this model, image, prompt, seed, dimensions, or steps: {path}"
        )
    validate_latents(torch, checkpoint["latents"], expected_shape)
    return checkpoint["latents"]


def resize_start_image(image_path: Path, width: int, height: int) -> Image.Image:
    from PIL import Image, ImageOps

    with Image.open(image_path) as source:
        image = ImageOps.fit(source.convert("RGB"), (width, height), method=Image.Resampling.LANCZOS)
    return image


def encode_frames(ffmpeg: str, frames: np.ndarray, output_temp: Path, width: int, height: int, fps: int) -> None:
    command = [
        ffmpeg,
        "-hide_banner",
        "-loglevel",
        "error",
        "-y",
        "-f",
        "rawvideo",
        "-pix_fmt",
        "rgb24",
        "-s:v",
        f"{width}x{height}",
        "-r",
        str(fps),
        "-i",
        "-",
        "-an",
        "-c:v",
        "libx264",
        "-preset",
        "medium",
        "-crf",
        "18",
        "-pix_fmt",
        "yuv420p",
        "-movflags",
        "+faststart",
        str(output_temp),
    ]
    process = subprocess.Popen(command, stdin=subprocess.PIPE, stderr=subprocess.PIPE)
    assert process.stdin is not None
    assert process.stderr is not None
    try:
        for frame in frames:
            rgb = frame
            if getattr(rgb, "dtype", None) != "uint8":
                import numpy as np

                rgb = np.clip(rgb * 255.0, 0, 255).astype(np.uint8)
            if rgb.shape != (height, width, 3):
                raise ValueError(f"Unexpected generated frame shape: {rgb.shape}")
            process.stdin.write(rgb.tobytes())
        process.stdin.close()
        stderr = process.stderr.read().decode("utf-8", errors="replace")
        status = process.wait()
    except BaseException:
        process.kill()
        process.wait()
        raise
    if status != 0:
        raise RuntimeError(f"ffmpeg could not encode generated frames:\n{stderr.strip()}")


def main() -> int:
    args = parse_args()
    cgroup_memory_limit, cgroup_swap_limit = check_cgroup_limits()
    started = time.monotonic()
    image_path, prompt_path, output_path, prompt = validate(args)
    model_dir = args.model_dir.expanduser().resolve()
    verified_model_revision = check_model_files(model_dir)
    ffmpeg = check_ffmpeg()

    import numpy as np
    import torch

    torch.set_num_threads(4)
    free_vram, total_vram, allocator_fraction = ensure_gpu_memory(torch)
    expected_identity = latent_identity(
        image_path=image_path,
        prompt=prompt,
        model_revision=verified_model_revision,
        args=args,
    )
    latent_shape = expected_latent_shape(model_dir, args)
    checkpoint_path = latent_checkpoint_path(output_path)
    checkpoint_hash: str | None = None
    prompt_cache_path: Path | None = None
    if args.resume_latents:
        latents = load_latent_checkpoint(torch, checkpoint_path, expected_identity, latent_shape)
        checkpoint_hash = identity_digest(expected_identity)
    else:
        from diffusers import AutoencoderKLWan, UniPCMultistepScheduler, WanImageToVideoPipeline, WanTransformer3DModel

        prompt_embeds, negative_prompt_embeds, prompt_cache_path, _ = get_prompt_embeddings(
            torch=torch,
            model_dir=model_dir,
            output_path=output_path,
            prompt=prompt,
            negative_prompt=NEGATIVE_PROMPT,
            model_revision=verified_model_revision,
        )
        transformer = WanTransformer3DModel.from_pretrained(
            model_dir,
            subfolder="transformer",
            torch_dtype=torch.bfloat16,
            low_cpu_mem_usage=True,
            device_map="cuda",
            local_files_only=True,
        )
        vae = AutoencoderKLWan.from_pretrained(
            model_dir,
            subfolder="vae",
            torch_dtype=torch.float32,
            low_cpu_mem_usage=True,
            local_files_only=True,
        ).to("cuda")
        vae.enable_tiling()
        scheduler = UniPCMultistepScheduler.from_pretrained(
            model_dir, subfolder="scheduler", local_files_only=True
        )
        pipeline = WanImageToVideoPipeline(
            tokenizer=None,
            text_encoder=None,
            vae=vae,
            scheduler=scheduler,
            image_encoder=None,
            transformer=transformer,
            expand_timesteps=True,
        )
        image = resize_start_image(image_path, args.width, args.height)
        generator = torch.Generator(device="cuda").manual_seed(args.seed)
        prompt_embeds = prompt_embeds.to(device="cuda", dtype=torch.bfloat16)
        negative_prompt_embeds = negative_prompt_embeds.to(device="cuda", dtype=torch.bfloat16)

        print(
            f"Rendering {args.frames} latent frames at {args.width}x{args.height}; "
            f"{free_vram / 1024**3:.1f} GiB free VRAM before model loading; "
            f"GPU allocation is capped at {allocator_fraction * total_vram / 1024**3:.1f} GiB.",
            flush=True,
        )
        with torch.inference_mode():
            result = pipeline(
                image=image,
                prompt_embeds=prompt_embeds,
                negative_prompt_embeds=negative_prompt_embeds,
                height=args.height,
                width=args.width,
                num_frames=args.frames,
                num_inference_steps=args.steps,
                guidance_scale=5.0,
                generator=generator,
                output_type="latent",
            )
        latents = result.frames
        validate_latents(torch, latents, latent_shape)
        checkpoint_hash = save_latent_checkpoint(torch, checkpoint_path, latents, expected_identity)
        print(f"Saved recoverable latent checkpoint to {checkpoint_path}", flush=True)
        video_processor = pipeline.video_processor
        del result, pipeline, transformer, scheduler, prompt_embeds, negative_prompt_embeds
        gc.collect()
        torch.cuda.empty_cache()
    if args.resume_latents:
        from diffusers import AutoencoderKLWan
        from diffusers.video_processor import VideoProcessor

        vae = AutoencoderKLWan.from_pretrained(
            model_dir,
            subfolder="vae",
            torch_dtype=torch.float32,
            low_cpu_mem_usage=True,
            local_files_only=True,
        ).to("cuda")
        vae.enable_tiling()
        video_processor = VideoProcessor(vae_scale_factor=vae.config.scale_factor_spatial)
        print(
            f"Resuming VAE decode from {checkpoint_path}; latent checkpoint matches the verified settings.",
            flush=True,
        )

    with torch.inference_mode():
        latents = latents.to(device="cuda", dtype=vae.dtype)
        latents_mean = (
            torch.tensor(vae.config.latents_mean)
            .view(1, vae.config.z_dim, 1, 1, 1)
            .to(latents.device, latents.dtype)
        )
        latents_std = 1.0 / torch.tensor(vae.config.latents_std).view(
            1, vae.config.z_dim, 1, 1, 1
        ).to(latents.device, latents.dtype)
        latents = latents / latents_std + latents_mean
        video = vae.decode(latents, return_dict=False)[0]
        decoded_frames = video_processor.postprocess_video(video, output_type="np")
    frames = np.asarray(decoded_frames[0])
    if frames.ndim != 4 or frames.shape[0] != args.frames:
        raise RuntimeError(f"Unexpected decoded video shape: {frames.shape}")
    if frames.shape[1:3] != (args.height, args.width):
        raise RuntimeError(f"Unexpected decoded frame dimensions: {frames.shape[1:3]}")
    if frames.dtype != np.uint8:
        frames = np.clip(frames * 255.0, 0, 255).astype(np.uint8)

    output_temp = output_path.with_name(f".{output_path.stem}.{os.getpid()}.tmp.mp4")
    sidecar_path = output_path.with_suffix(".json")
    sidecar_temp = sidecar_path.with_name(sidecar_path.name + f".{os.getpid()}.tmp")
    try:
        encode_frames(ffmpeg, frames, output_temp, args.width, args.height, args.fps)
        metadata = {
            "model_repository": MODEL_REPOSITORY,
            "model_revision": verified_model_revision,
            "model_revision_source": "verified first line of each selected local Hugging Face download metadata file",
            "model_directory": str(model_dir),
            "image": str(image_path),
            "image_sha256": expected_identity["image_sha256"],
            "prompt_file": str(prompt_path),
            "prompt_sha256": expected_identity["prompt_sha256"],
            "prompt": prompt,
            "negative_prompt": NEGATIVE_PROMPT,
            "negative_prompt_sha256": expected_identity["negative_prompt_sha256"],
            "prompt_embedding_cache": str(prompt_cache_path) if prompt_cache_path else None,
            "latent_checkpoint": str(checkpoint_path),
            "latent_checkpoint_identity_sha256": checkpoint_hash,
            "seed": args.seed,
            "width": args.width,
            "height": args.height,
            "frames": args.frames,
            "steps": args.steps,
            "guidance_scale": 5.0,
            "fps": args.fps,
            "scheduler": "UniPCMultistepScheduler",
            "memory_mode": "full_gpu_with_latent_checkpoint",
            "free_vram_gib_before_load": round(free_vram / 1024**3, 3),
            "gpu_budget_gib": round(allocator_fraction * total_vram / 1024**3, 3),
            "cgroup_memory_limit_gib": round(cgroup_memory_limit / 1024**3, 3),
            "cgroup_swap_limit_gib": round(cgroup_swap_limit / 1024**3, 3),
            "runtime": {
                "python": sys.version.split()[0],
                "torch": torch.__version__,
                "diffusers": __import__("diffusers").__version__,
                "transformers": __import__("transformers").__version__,
                "device": torch.cuda.get_device_name(0),
                "dtype_transformer": "bfloat16",
                "dtype_vae": "float32",
                "allocator_memory_fraction": allocator_fraction,
                "ffmpeg": subprocess.run(
                    [ffmpeg, "-version"], capture_output=True, text=True, check=False
                ).stdout.splitlines()[0],
            },
            "elapsed_seconds": round(time.monotonic() - started, 2),
            "output_sha256": sha256_file(output_temp),
            "output_bytes": output_temp.stat().st_size,
            "created_utc": datetime.now(timezone.utc).isoformat(),
        }
        sidecar_temp.write_text(json.dumps(metadata, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        if args.overwrite:
            os.replace(output_temp, output_path)
            os.replace(sidecar_temp, sidecar_path)
        else:
            os.link(output_temp, output_path)
            output_temp.unlink()
            try:
                os.link(sidecar_temp, sidecar_path)
            except FileExistsError:
                output_path.unlink(missing_ok=True)
                raise
            sidecar_temp.unlink()
    finally:
        output_temp.unlink(missing_ok=True)
        sidecar_temp.unlink(missing_ok=True)

    print(f"Wrote {output_path}")
    print(f"Wrote {sidecar_path}")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (FileNotFoundError, FileExistsError, RuntimeError, ValueError) as error:
        print(f"error: {error}", file=sys.stderr)
        raise SystemExit(2)
