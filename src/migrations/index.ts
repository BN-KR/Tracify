import * as migration_20260811_220842_initial_payload_schema from './20260811_220842_initial_payload_schema';

export const migrations = [
  {
    up: migration_20260811_220842_initial_payload_schema.up,
    down: migration_20260811_220842_initial_payload_schema.down,
    name: '20260811_220842_initial_payload_schema'
  },
];
