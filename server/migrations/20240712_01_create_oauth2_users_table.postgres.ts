/* eslint-disable @typescript-eslint/naming-convention */
import { type QueryInterface } from 'sequelize';

import OAuth2User from '../src/resources/oauth2_user/model';

interface Params {
  context: QueryInterface;
}

export const up = async ({ context }: Params): Promise<void> => {
  const { user_id, ...unassociated_attributes } = OAuth2User.schemaDetails;
  await context.createTable('oauth2_users', { ...unassociated_attributes });
  await context.addColumn('oauth2_users', 'user_id', {
    ...user_id,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  });
};

export const down = async ({ context }: Params): Promise<void> => {
  await context.dropTable('oauth2_users');
  await context.removeColumn('oauth2_users', 'user_id');
};
