/* eslint-disable @typescript-eslint/naming-convention */

import { type QueryInterface } from 'sequelize';

import { UserFriendship } from '../src/resources';

interface Params {
  context: QueryInterface;
}

export const up = async ({ context }: Params): Promise<void> => {
  const { user_id, friend_id } = UserFriendship.schemaDetails;
  await context.createTable('user_friendships', {});
  await context.addColumn('user_friendships', 'user_id', {
    ...user_id,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  });
  await context.addColumn('user_friendships', 'friend_id', {
    ...friend_id,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  });
};

export const down = async ({ context }: Params): Promise<void> => {
  await context.dropTable('user_friendships');
};
