import { type QueryInterface } from 'sequelize';

import { UserBlock } from '../src/resources';

interface Params {
  context: QueryInterface;
}

export const up = async ({ context }: Params): Promise<void> => {
  await context.createTable('user_blocks', UserBlock.schemaDetails);
  await context.sequelize.query(`
    ALTER TABLE user_blocks
    ALTER COLUMN created_at TYPE TIMESTAMP(3) WITH TIME ZONE;
  `);
};

export const down = async ({ context }: Params): Promise<void> => {
  await context.dropTable('user_blocks');
};
