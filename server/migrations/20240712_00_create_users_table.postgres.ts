import { type QueryInterface } from 'sequelize';

import { User } from '../src/resources';

interface Params {
  context: QueryInterface;
}

export const up = async ({ context }: Params): Promise<void> => {
  await context.createTable('users', User.schemaDetails);
};

export const down = async ({ context }: Params): Promise<void> => {
  await context.dropTable('users');
};
