# Reviewed native kitchen motion

> **Current status, 27 September 2026: rejected by the user for appearance and motion quality.** Prior review passes below are historical technical/internal evidence, not aesthetic acceptance. The user selected [photorealistic AI-generated video](../../photoreal/TREATMENT.md) for the replacement. The current replacement is the [expanded Remotion film study](../../remotion-film/README.md), using original photographic scenes and animated kitchen records.

Nine coherent video sources replace the earlier interpolation between separately drawn poses. Each source starts from one painted reference and contains 121 generated frames at 768 × 512 / 24 fps. Parent and independent dense visual review passed all nine sources. Final assembled-film and browser results are recorded in the [film README](../README.md).

The original 49-frame tablet pilot and first cooking candidate were rejected. Their evidence remains in [the historical recovery record](RECOVERY.md). Only the approved files in [clips/](clips/) are assembly inputs.

| Scene | Seed | Motion review |
| --- | ---: | --- |
| Forecast | 41 | [Pencil and ledger](evidence/forecast-review.md) |
| Pantry | 31 | [Pear transfer](evidence/pantry-review.md) |
| Preparation | 43 | [Whisk and bowl](evidence/preparation-review.md) |
| Cooking | 71 | [Supported tray inspection](evidence/cooking-v2-review.md) |
| Waste | 53 | [Peelings and bowl](evidence/waste-review.md) |
| Receiving | 59 | [Pear inspection](evidence/receiving-review.md) |
| Team | 61 | [Roster and eye contact](evidence/team-review.md) |
| Sales | 23 | [Tablet withdrawal](evidence/sales-full-review.md) |
| Tomorrow | 67 | [Pencil and conversation](evidence/tomorrow-review.md) |

Each clip has its original JSON render sidecar, including the actual output hash, source-image and prompt hashes, seed, dimensions, frame count, steps, model revision and runtime. Historical absolute paths in sidecars describe the authoring machine; the assembler reads the MP4/JSON pairs in the supplied input directory.

## Rendering and provenance

The model is [Wan2.2 TI2V 5B](https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B-Diffusers), pinned to revision `b8fff7315c768468a5333511427288870b2e9635`; its repository declares Apache-2.0. Model weights are authoring assets in ignored `.local/video-models/wan22-5b`. They are not application dependencies and never run or download in the visitor’s browser.

Starting images are in [assets/](assets/), with original drawing provenance in [sources.json](sources.json). The tablet starting image was edited using imagegen to remove an unsupported upright receipt. Exact motion instructions are in [prompts/](prompts/): sales uses `sales-motion-v2.txt`, cooking uses `cooking-motion-v2.txt`, and the other scenes use their unversioned motion prompt. All accepted sources used 40 generation steps. The renderer verifies pinned local download metadata before claiming the model revision.

[render-native-motion.py](../render-native-motion.py) uses full-GPU operation, a recoverable latent checkpoint and tiled float32 VAE decoding. It requires at least 22 GiB of free GPU memory and enforces a GPU allocation ceiling. Every heavy render must run inside a cgroup with a 14 GiB RAM / 1 GiB swap ceiling. The failed CPU/group-offload fallback and untiled decode experiment must not be reused. No guard was weakened to obtain these clips.

Example single-scene generation, with the GPU reserved and the persistent model already available:

```sh
mkdir -p .local/kitchen-motion
systemd-run --user --wait --pipe --collect \
  -p MemoryMax=14G -p MemorySwapMax=1G -p OOMPolicy=stop \
  --setenv=MIOPEN_FIND_MODE=FAST --working-directory="$PWD" \
  /home/robangeles/ai-env/bin/python3 \
  docs/designs/kitchen-animation/atelier/render-native-motion.py \
  --image docs/designs/kitchen-animation/atelier/native/assets/cooking-start.png \
  --prompt-file docs/designs/kitchen-animation/atelier/native/prompts/cooking-motion-v2.txt \
  --output .local/kitchen-motion/cooking-new.mp4 \
  --width 768 --height 512 --frames 121 --steps 40 --seed 71
```

`MIOPEN_FIND_MODE=FAST` is scoped to the authoring process, following [AMD’s documented find mode](https://rocm.docs.amd.com/projects/MIOpen/en/docs-7.1.0/how-to/find-and-immediate.html). It changes no application configuration. Scripts use the existing local authoring environment; no application package was added.

## Assembly

Rebuilding from approved clips needs Python’s standard library and FFmpeg, not the video model or GPU:

```sh
mkdir -p .local/kitchen-motion
python3 docs/designs/kitchen-animation/atelier/assemble-native-film.py \
  --input-dir docs/designs/kitchen-animation/atelier/native/clips \
  --output .local/kitchen-motion/kitchen-day-candidate.mp4
```

The assembler verifies source hashes and decoded frame counts, preserves the nine chapter times, maps time linearly within each shot and interpolates only adjacent native video frames. There is no repeated per-pose easing and no looping. Output is muted H.264, 960 × 640 / 24 fps, exactly 1,920 frames / 80 seconds. It refuses to overwrite the preview movie or poster; publication follows complete-film review. `--overwrite` only replaces an explicitly selected candidate.

[Retimed chapter reviews](evidence/retimed-chapters-review.md) and [assembly tooling review](evidence/assembly-review.md) distinguish motion inspection from technical checks. Zero dropped browser frames alone does not establish believable hands or props. The painted footage retains natural motion softness; user aesthetic acceptance remains separate from these checks.
