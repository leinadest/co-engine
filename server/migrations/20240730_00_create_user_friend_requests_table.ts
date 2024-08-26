import { type QueryInterface } from 'sequelize';

import { UserFriendRequest } from '../src/resources';

interface Params {
  context: QueryInterface;
}

export const up = async ({ context }: Params): Promise<void> => {
  await context.createTable(
    'user_friend_requests',
    UserFriendRequest.schemaDetails
  );
  await context.sequelize.query(`
    ALTER TABLE user_friend_requests
    ALTER COLUMN created_at TYPE TIMESTAMP(3) WITH TIME ZONE;
  `);
};

export const down = async ({ context }: Params): Promise<void> => {
  await context.dropTable('user_friend_requests');
};
