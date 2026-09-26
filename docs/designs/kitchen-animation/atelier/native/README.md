# Contact-motion correction, in progress

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

A parent-run containment test launched a dedicated systemd user service with MemoryMax=64M and MemorySwapMax=0, verified its cgroup limit, then attempted a 128 MB allocation. The service alone was OOM-killed at a measured 64.0 MB peak with no swap, confirming enforcement. Real rendering is to use a 14 GiB RAM / 1 GiB swap ceiling and full-GPU operation. Model download uses a separate 2 GiB RAM / zero-swap service. User permission to stop the unrelated GPU model server is pending; it has not been stopped.

The final safety checks are recorded in [renderer-safety.json](evidence/renderer-safety.json): an unbounded process, unlimited swap, an occupied GPU and a mismatched checkpoint are rejected; a small tensor checkpoint preserves the batch dimension on roundtrip; the generated service command preserves the working directory and limits. The final post-restart application gate passed lint, types, 57 test files / 311 tests and build after restoring the existing project PostgreSQL cluster. These checks do not certify native video quality or a successful full render. `--resume-latents` can resume a saved matching checkpoint after a decode failure; that decode recovery still needs an actual native render to verify end to end.

Malformed checkpoint channels, temporal/spatial dimensions and non-finite values are rejected before decoding, using the pinned VAE configuration (48 latent channels, temporal scale 4, spatial scale 16).

Final independent review returned **PASS for corrective source only**, including exact latent validation before checkpointing/resumed decoding and identical normalization in both paths. No new render is automatically queued. The separate `passe-wan-download.service` continues restoring model files under its 2 GiB cap; `llama-server.service` remains running pending explicit permission to pause it.
