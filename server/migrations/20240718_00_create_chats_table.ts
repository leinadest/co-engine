import { type QueryInterface } from 'sequelize';

import Chat from '../src/resources/chat/model';

interface Params {
  context: QueryInterface;
}

export const up = async ({ context }: Params): Promise<void> => {
  await context.createTable('chats', Chat.schemaDetails);
  await context.sequelize.query(`
    ALTER TABLE chats
    ALTER COLUMN created_at TYPE TIMESTAMP(3) WITH TIME ZONE,
    ALTER COLUMN last_message_at TYPE TIMESTAMP(3) WITH TIME ZONE;
  `);
};

export const down = async ({ context }: Params): Promise<void> => {
  await context.dropTable('chats');
};
