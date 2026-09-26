"""Render an illustrated action as native video using local RIFE 4.25 inference.

The source drawings remain unchanged. This is an offline video-rendering helper,
not an application dependency. Run setup-renderer.py to obtain the MIT model.
"""
import argparse
import hashlib
import math
import os
from pathlib import Path
import subprocess
import sys
import time

import cv2
import numpy as np
import torch
import torch.nn.functional as F

parser = argparse.ArgumentParser()
parser.add_argument('--input', required=True)
parser.add_argument('--output', required=True)
parser.add_argument('--duration', type=float, required=True)
parser.add_argument('--mode', choices=['once', 'cycle'], required=True)
parser.add_argument('--fps', type=int, default=24)
args = parser.parse_args()
model_root = Path(os.environ.get('RIFE_DIR', '/tmp/passe-rife'))
weights = model_root / 'train_log/flownet.pkl'
if not weights.is_file():
    raise SystemExit('Run setup-renderer.py before rendering the film.')
if hashlib.sha256(weights.read_bytes()).hexdigest() != '6615790efd627772917205db291f51cd392528a157ecbb2ecaeec3bff8eb6de2':
    raise SystemExit('RIFE model checksum does not match the pinned 4.25 release.')
sys.path.insert(0, str(model_root))
from train_log.IFNet_HDv3 import IFNet

torch.set_num_threads(4)
torch.set_grad_enabled(False)
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
if device.type == 'cuda':
    # Leave the other local GPU workloads alone; this renderer needs <1 GB.
    torch.cuda.set_per_process_memory_fraction(.12)
net = IFNet().eval().to(device)
state = torch.load(weights, map_location='cpu', weights_only=True)
state = {k.removeprefix('module.'): v for k, v in state.items()}
# The official checkpoint includes two training-only heads commented out in IFNet.
net.load_state_dict({k: v for k, v in state.items() if not k.startswith(('teacher.', 'caltime.'))}, strict=True)
images = [cv2.imread(str(p)) for p in sorted(Path(args.input).glob('*.png'))]
if len(images) < 2 or any(im is None for im in images):
    raise SystemExit('Expected at least two readable source frames.')
height, width = images[0].shape[:2]
if any(im.shape != images[0].shape for im in images):
    raise SystemExit('All source frames must have the same dimensions.')
# Half-scale flow estimation handles the larger gaps between illustrated poses.
padding = (0, math.ceil(width / 128) * 128 - width, 0, math.ceil(height / 128) * 128 - height)
tensors = [F.pad(torch.from_numpy(im.transpose(2, 0, 1).copy()).float().unsqueeze(0).to(device) / 255, padding) for im in images]
frames = round(args.duration * args.fps)
if frames < 1 or abs(frames / args.fps - args.duration) > 1e-7:
    raise SystemExit('Duration must resolve to a positive whole frame count.')
command = ['ffmpeg', '-y', '-hide_banner', '-loglevel', 'error', '-f', 'rawvideo', '-pixel_format', 'bgr24', '-video_size', f'{width}x{height}', '-framerate', str(args.fps), '-i', 'pipe:0', '-frames:v', str(frames), '-c:v', 'libx264', '-threads', '2', '-preset', 'fast', '-crf', '18', '-pix_fmt', 'yuv420p', '-an', '-movflags', '+faststart', args.output]
start = time.monotonic()
with subprocess.Popen(command, stdin=subprocess.PIPE) as encoder:
    try:
        with torch.inference_mode():
            for frame in range(frames):
                t = frame / args.fps
                position = (t / 1.2 * len(images)) % len(images) if args.mode == 'cycle' else min(1, t / max(.1, args.duration - .75)) * (len(images) - 1)
                first = int(position)
                second = (first + 1) % len(images) if args.mode == 'cycle' else min(first + 1, len(images) - 1)
                amount = position - first
                # Ease discrete, deliberate actions; whisking remains continuous.
                if args.mode == 'once':
                    amount = amount * amount * (3 - 2 * amount)
                if amount < .001 or first == second:
                    rendered = images[first]
                else:
                    pair = torch.cat((tensors[first], tensors[second]), 1)
                    result = net(pair, timestep=amount, scale_list=[32, 16, 8, 4, 2])[2][-1]
                    rendered = (result[0, :, :height, :width].clamp(0, 1) * 255).byte().cpu().numpy().transpose(1, 2, 0)
                encoder.stdin.write(np.ascontiguousarray(rendered).tobytes())
    finally:
        encoder.stdin.close()
        if encoder.wait() != 0:
            raise SystemExit('Video encoder failed.')
print(f'{Path(args.output).name}: {frames} frames, {args.duration:.2f}s, rendered in {time.monotonic() - start:.1f}s', flush=True)
