import { type QueryInterface } from 'sequelize';

import { UserFriendship } from '../src/resources';

interface Params {
  context: QueryInterface;
}

export const up = async ({ context }: Params): Promise<void> => {
  await context.createTable('user_friendships', UserFriendship.schemaDetails);
};

export const down = async ({ context }: Params): Promise<void> => {
  await context.dropTable('user_friendships');
};
