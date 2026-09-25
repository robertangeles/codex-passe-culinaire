import * as migration_20260925_060905_phase1_initial from './20260925_060905_phase1_initial';

export const migrations = [
  {
    up: migration_20260925_060905_phase1_initial.up,
    down: migration_20260925_060905_phase1_initial.down,
    name: '20260925_060905_phase1_initial'
  },
];
