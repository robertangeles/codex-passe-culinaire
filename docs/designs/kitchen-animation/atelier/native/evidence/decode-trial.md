# Contained whole-frame decode trial

The optional untiled decode trial resumed the accepted sales latent checkpoint using unchanged float32 precision. Its source and application checks passed, but the actual GPU trial stopped at the existing allocator limit after 2m54s. The service restored the local model server. Peak host memory was 3.8 GiB, swap 0; this was an isolated GPU allocation failure, not host memory exhaustion.

The optional flag was removed after the test. Remaining chapters use the already successful tiled decoder. The source sales/pantry clips and checkpoints remain intact. No RAM, swap or GPU guard was weakened, and no new dependency was added.
