# Contact-motion correction, in progress

**Current status, 27 September:** Four 121-frame native sources have passed parent and independent visual review: sales, pantry, forecast and preparation. Cooking failed because the small oven cloth becomes a large black fabric; its source is rejected and a constrained inspection prompt is ready. Waste, receiving, team and tomorrow remain unrendered. The batch stopped safely during waste model loading when a separate image-generation process occupied about 19 GB of GPU memory. The finished clips are intact. The existing preview remains the rejected earlier film. The records below are chronological; earlier unverified status statements describe earlier checkpoints.

The user liked the illustrated style of the 80-second film but rejected its glitchy movement and hands passing through objects. The existing `../kitchen-day.mp4` is not motion-approved. Zero dropped playback frames did not establish physically coherent character animation.

## Confirmed defects in the existing film

Dense decoded-frame review confirmed:

- **68.4–70.2s, tablet:** the index finger smears over the display and lower bezel during withdrawal.
- **12.7–16.4s, pantry:** the pear briefly disappears during transfer around 13.7–14.1s, then merges ambiguously with the basket lip around 15.5–16.0s.
- **41.9–44.8s, waste:** peelings blur or disappear between fingers and bowl around 42.6–43.0s; the rim contact is ambiguous.
- **36.4–38.25s, oven:** the hands and cloth become ghosted around 37.0–37.4s as grip changes.
- **Preparation:** the whisk/bowl contact is more stable, but independently drawn poses can shimmer at the repeated seam.

RIFE was asked to interpolate between independently drawn poses, sometimes separated by a large action or a change of contact. It has no explicit model of solid props, grip or depth ordering. The code also eases each pose interval separately, producing repeated deceleration. These are authoring defects, not a browser playback diagnosis.

## Candidate approach

Use a single coherent starting image and generate the motion as a video with [Wan2.2 TI2V 5B](https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B-Diffusers), instead of asking optical flow to bridge widely different drawings. This remains a candidate until actual contact motion is inspected. A video model can also produce bad anatomy or collisions; its use is not itself an acceptance criterion.

[assets/sales-contact.png](assets/sales-contact.png) corrects the unsupported upright receipt in the historical tablet contact drawing. It was edited with the built-in imagegen tool; [the exact edit prompt](prompts/sales-contact-edit.txt) is retained. Other starting images are technically extracted existing drawings, listed in [sources.json](sources.json). [Motion prompts](prompts/) describe one constrained action per scene. These images and prompts are not wired into the live preview.

The offline script is [render-native-motion.py](../render-native-motion.py). It loads the pinned local model, verifies each selected file's Hugging Face download metadata revision, encodes text before loading the video transformer, and requires at least 22 GiB of free GPU memory. It preserves the existing movie and poster. The earlier low-memory fallback is rejected after system memory exhaustion during decoding. Further rendering must run inside a systemd service with a hard RAM/swap cap. Models and generated candidates now use persistent, git-ignored project storage under `.local/` pending review.

Pinned model revision: `b8fff7315c768468a5333511427288870b2e9635`. The initial download is approximately 34 GB and lives at `.local/video-models/wan22-5b`; it is not an application dependency and is never sent to the browser. The official model repository declares Apache-2.0. Existing installed authoring libraries are PyTorch, Diffusers, Transformers, NumPy, Pillow and FFmpeg. No application packages were installed.

```sh
HF_HUB_DISABLE_XET=1 python3 - <<'PY'
from huggingface_hub import snapshot_download
snapshot_download(
    'Wan-AI/Wan2.2-TI2V-5B-Diffusers',
    revision='b8fff7315c768468a5333511427288870b2e9635',
    local_dir='.local/video-models/wan22-5b',
    allow_patterns=['*.json', 'text_encoder/*', 'tokenizer/*', 'transformer/*', 'vae/*', 'scheduler/*'],
    max_workers=6,
)
PY
mkdir -p .local/kitchen-motion
systemd-run --user --wait --pipe --collect -p MemoryMax=14G -p MemorySwapMax=1G \
  -p OOMPolicy=stop --working-directory="$PWD" /home/robangeles/ai-env/bin/python3 \
  docs/designs/kitchen-animation/atelier/render-native-motion.py \
  --image docs/designs/kitchen-animation/atelier/native/assets/sales-contact.png \
  --prompt-file docs/designs/kitchen-animation/atelier/native/prompts/sales-motion.txt \
  --output .local/kitchen-motion/sales-pilot.mp4 \
  --width 576 --height 384 --frames 49 --steps 40 --seed 17
```

## Verification status

Script syntax/help pass. Parent tested matching, missing and mismatched model provenance metadata. Full application checks pass: lint, types, 57 files / 311 tests and build. Independent source review passed after fixing unverified revision reporting. These results do not establish rendering success or visual quality. The first native test completed 40 diffusion steps (5m05s at 576 × 384, 49 frames), then failed during decoding. No usable output survived the workstation restart, and no native motion quality verdict is available. The full replacement film is not complete.

## Memory failure and recovery

At approximately 19:20 on 26 September 2026, the prior boot's kernel logs recorded global memory exhaustion and killed VS Code processes while the low-memory native render was decoding. The workstation subsequently restarted. Its temporary model and render files were lost; repository artwork and prompts survived. The fallback was not sufficiently contained and must not be rerun.

A parent-run containment test launched a dedicated systemd user service with MemoryMax=64M and MemorySwapMax=0, verified its cgroup limit, then attempted a 128 MB allocation. The service alone was OOM-killed at a measured 64.0 MB peak with no swap, confirming enforcement. Real rendering is to use a 14 GiB RAM / 1 GiB swap ceiling and full-GPU operation. Model download uses a separate 2 GiB RAM / zero-swap service. On 27 September the user requested continuation after the proposed temporary pause. The scoped tablet render temporarily stops `llama-server.service`, with both a systemd `ExecStopPost` and shell cleanup that start it again. The service configuration is unchanged.

The final safety checks are recorded in [renderer-safety.json](evidence/renderer-safety.json): an unbounded process, unlimited swap, an occupied GPU and a mismatched checkpoint are rejected; a small tensor checkpoint preserves the batch dimension on roundtrip; the generated service command preserves the working directory and limits. The final post-restart application gate passed lint, types, 57 test files / 311 tests and build after restoring the existing project PostgreSQL cluster. These checks do not certify native video quality or a successful full render. `--resume-latents` can resume a saved matching checkpoint after a decode failure; that decode recovery still needs an actual native render to verify end to end.

Malformed checkpoint channels, temporal/spatial dimensions and non-finite values are rejected before decoding, using the pinned VAE configuration (48 latent channels, temporal scale 4, spatial scale 16).

Final independent review returned **PASS for corrective source only**, including exact latent validation before checkpointing/resumed decoding and identical normalization in both paths. The persistent model download completed under its 2 GiB cap. A contained 49-frame tablet pilot began on 27 September, completed diffusion and saved `.local/kitchen-motion/sales-pilot.latents.pt`; the pilot decoded and encoded successfully in 6m44s, within its 14 GiB RAM / 1 GiB swap limit. The model server was confirmed running again after automatic restoration. Parent inspection of all first 35 hand/contact frames and whole-shot samples found improved continuity but an unwanted pullback and downward finger movement; this is not accepted as a final shot. A longer, higher-resolution candidate is being rendered with a more specific withdrawal instruction. The full replacement remains unfinished.

### 27 September successful contained pilot

The 49-frame, 576 × 384 tablet pilot is an internal test. Its [render provenance](evidence/sales-pilot-render.json) records the actual output hash and settings. The contained service reported success, 14.0 GiB RAM peak and 830.5 MiB swap peak; no cgroup OOM occurred. It is not the final eight-second sales chapter, and the existing 80-second preview is unchanged.

### Sales source accepted; full film still in progress

The longer 121-frame, 768 × 512 candidate completed in 12m37s. [Parent and independent contact review](evidence/sales-full-review.md) passed its clean tablet withdrawal, hand-under-chin gesture, stable face and props. Parent also checked the exact eight-second retimed chapter (192 frames). This accepts one chapter only; the old 80-second preview has not been replaced.

The new [assembler](../assemble-native-film.py) uses the existing nine chapter times, linear endpoint retiming, and motion interpolation between adjacent native video frames. It does not interpolate between separately drawn key poses or add per-pose easing. It validates source hashes and full decoded frame counts, protects the existing film and poster, and produces a candidate for visual review. [Source review and synthetic 80-second checks passed](evidence/assembly-review.md), as did the parent lint/typecheck/311-test/build gate.

The pantry candidate is being rendered next with the same 768 × 512 / 121-frame / 40-step settings. Its process sets `MIOPEN_FIND_MODE=FAST`, which uses cached solver selection or immediate fallback rather than a full search, per [AMD's MIOpen documentation](https://rocm.docs.amd.com/projects/MIOpen/en/docs-7.1.0/how-to/find-and-immediate.html). This is a scoped authoring environment variable, not an application or system configuration change. It does not replace visual review.
