"""Fetch the pinned MIT-licensed RIFE 4.25 authoring files into a local cache."""
import hashlib
from io import BytesIO
import os
from pathlib import Path
import urllib.request
import zipfile

root = Path(os.environ.get('RIFE_DIR', '/tmp/passe-rife'))
files = {
    'train_log/flownet.pkl': '6615790efd627772917205db291f51cd392528a157ecbb2ecaeec3bff8eb6de2',
    'train_log/IFNet_HDv3.py': '655b4c772b037967b86c2dd31c8fa3b5323b79dd9a0e0088708d89149bbc8a32',
    'model/warplayer.py': 'feb3af9475b724749b023d1913c3b135431eff13d0045b8efb472a699058385f',
    'LICENSE': '7932fb49341512b959b1744a6d9cbb39e5a1ec89da438a34d0454d5d8df9fecd',
}

def verified(data, expected):
    if hashlib.sha256(data).hexdigest() != expected:
        raise RuntimeError('Downloaded renderer file failed its pinned SHA-256 check.')
    return data

def fetch(url):
    with urllib.request.urlopen(url, timeout=45) as response:
        return response.read()

def save(name, data):
    path = root / name
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(verified(data, files[name]))

if all((root / name).is_file() and hashlib.sha256((root / name).read_bytes()).hexdigest() == digest for name, digest in files.items()):
    print(f'Verified RIFE 4.25 cache: {root}')
else:
    archive = verified(fetch('https://drive.usercontent.google.com/download?id=1ZKjcbmt1hypiFprJPIKW0Tt0lr_2i7bg&export=download&confirm=t'), 'e63d481b7ae5d4a4e6ad7ac5b410ff78f3bf7be3b51b2e38ca8152747abde5b4')
    with zipfile.ZipFile(BytesIO(archive)) as source:
        for name in ['train_log/flownet.pkl', 'train_log/IFNet_HDv3.py']:
            save(name, source.read(name))
    base = 'https://raw.githubusercontent.com/hzwer/Practical-RIFE/bbfd2ea90910789a860ea3e2b32a240cd577b75e/'
    for name in ['model/warplayer.py', 'LICENSE']:
        save(name, fetch(base + name))
    print(f'Prepared RIFE 4.25 cache: {root}')
