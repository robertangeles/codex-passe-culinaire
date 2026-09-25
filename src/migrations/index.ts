import * as migration_20260925_060905_phase1_initial from './20260925_060905_phase1_initial';
import * as migration_20260925_063228 from './20260925_063228';
import * as migration_20260925_063612 from './20260925_063612';
import * as migration_20260925_064400 from './20260925_064400';
import * as migration_20260925_064902 from './20260925_064902';
import * as migration_20260925_065028 from './20260925_065028';
import * as migration_20260925_065737 from './20260925_065737';
import * as migration_20260925_200000_phase5_editorial from './20260925_200000_phase5_editorial';
import * as migration_20260925_190000_search_indexes from './20260925_190000_search_indexes';

export const migrations = [
  {
    up: migration_20260925_060905_phase1_initial.up,
    down: migration_20260925_060905_phase1_initial.down,
    name: '20260925_060905_phase1_initial',
  },
  {
    up: migration_20260925_063228.up,
    down: migration_20260925_063228.down,
    name: '20260925_063228',
  },
  {
    up: migration_20260925_063612.up,
    down: migration_20260925_063612.down,
    name: '20260925_063612',
  },
  {
    up: migration_20260925_064400.up,
    down: migration_20260925_064400.down,
    name: '20260925_064400',
  },
  {
    up: migration_20260925_064902.up,
    down: migration_20260925_064902.down,
    name: '20260925_064902',
  },
  {
    up: migration_20260925_065028.up,
    down: migration_20260925_065028.down,
    name: '20260925_065028',
  },
  {
    up: migration_20260925_065737.up,
    down: migration_20260925_065737.down,
    name: '20260925_065737',
  },
  {
    up: migration_20260925_190000_search_indexes.up,
    down: migration_20260925_190000_search_indexes.down,
    name: '20260925_190000_search_indexes'
  },
  {
    up: migration_20260925_200000_phase5_editorial.up,
    down: migration_20260925_200000_phase5_editorial.down,
    name: '20260925_200000_phase5_editorial',
  },
];
