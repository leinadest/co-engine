import { type QueryInterface } from 'sequelize';

import Chat from '../src/resources/chat/model';

interface Params {
  context: QueryInterface;
}

export const up = async ({ context }: Params): Promise<void> => {
  await context.createTable('chats', Chat.schemaDetails);
};

export const down = async ({ context }: Params): Promise<void> => {
  await context.dropTable('chats');
};
