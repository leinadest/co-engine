import { type QueryInterface } from 'sequelize';

import { User } from '../src/resources';

interface Params {
  context: QueryInterface;
}

export const up = async ({ context }: Params): Promise<void> => {
  await context.createTable('users', User.schemaDetails);
  await context.sequelize.query(`
    ALTER TABLE users
    ALTER COLUMN created_at TYPE TIMESTAMP(3) WITH TIME ZONE,
    ALTER COLUMN last_login_at TYPE TIMESTAMP(3) WITH TIME ZONE;
  `);
};

export const down = async ({ context }: Params): Promise<void> => {
  await context.dropTable('users');
};
