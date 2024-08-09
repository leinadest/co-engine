import { type QueryInterface } from 'sequelize';

import { UserBlock } from '../src/resources';

interface Params {
  context: QueryInterface;
}

export const up = async ({ context }: Params): Promise<void> => {
  const { user_id, blocked_user_id, ...rest } = UserBlock.schemaDetails;
  await context.createTable('user_blocks', rest);
  await context.addColumn('user_blocks', 'user_id', {
    ...user_id,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  });
  await context.addColumn('user_blocks', 'blocked_user_id', {
    ...blocked_user_id,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  });
};

export const down = async ({ context }: Params): Promise<void> => {
  await context.dropTable('user_blocks');
};
