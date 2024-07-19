import { type QueryInterface } from 'sequelize';

import ChatUser from '../src/resources/chat_user/model';

interface Params {
  context: QueryInterface;
}

export const up = async ({ context }: Params): Promise<void> => {
  await context.createTable('chat_users', ChatUser.schemaDetails);
};

export const down = async ({ context }: Params): Promise<void> => {
  await context.dropTable('chat_users');
};
