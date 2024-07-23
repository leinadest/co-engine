/* eslint-disable @typescript-eslint/naming-convention */

import { type QueryInterface } from 'sequelize';

import { UserFriendship } from '../src/resources';

interface Params {
  context: QueryInterface;
}

export const up = async ({ context }: Params): Promise<void> => {
  const { sender_id, receiver_id, ...unassociated_attributes } =
    UserFriendship.schemaDetails;
  await context.createTable('user_friendships', unassociated_attributes);
  await context.addColumn('user_friendships', 'sender_id', {
    ...sender_id,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  });
  await context.addColumn('user_friendships', 'receiver_id', {
    ...receiver_id,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  });
};

export const down = async ({ context }: Params): Promise<void> => {
  await context.dropTable('user_friendships');
};
