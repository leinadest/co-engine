/* eslint-disable @typescript-eslint/naming-convention */

import { type QueryInterface } from 'sequelize';

import { UserFriendRequest } from '../src/resources';

interface Params {
  context: QueryInterface;
}

export const up = async ({ context }: Params): Promise<void> => {
  const { sender_id, receiver_id, ...unassociated_attributes } =
    UserFriendRequest.schemaDetails;
  await context.createTable('user_friend_requests', unassociated_attributes);
  await context.addColumn('user_friend_requests', 'sender_id', {
    ...sender_id,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  });
  await context.addColumn('user_friend_requests', 'receiver_id', {
    ...receiver_id,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  });
};

export const down = async ({ context }: Params): Promise<void> => {
  await context.dropTable('user_friend_requests');
};
