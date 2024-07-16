import { type QueryInterface } from 'sequelize';

import { NODE_ENV } from '../src/config';

const testUsers = [
  {
    username: 'test username',
    email: 'test email',
    password_hash: 'test password hash',
  },
  {
    username: 'test username 2',
    email: 'test email 2',
    password_hash: 'test password hash 2',
  },
];

interface Params {
  context: QueryInterface;
}

export const up = async ({ context }: Params): Promise<void> => {
  try {
    if (NODE_ENV === 'development') {
      console.log('*** BULK INSERTING USERS... ***');
      const result = await context.bulkInsert('users', testUsers);
      console.log(`*** BULK INSERTED USERS RESULT ***`);
      console.log(result);
    }
  } catch (error: any) {
    console.log('*** ERROR INSERTING USERS ***');
    console.log(error);
  }
};

export const down = async ({ context }: Params): Promise<void> => {
  try {
    if (NODE_ENV === 'development') {
      console.log('*** BULK DELETING USERS... ***');
      const result = await context.bulkDelete('users', {}, {});
      console.log('*** BULK DELETED USERS RESULT ***');
      console.log(result);
    }
  } catch (error: any) {
    console.log('*** ERROR DELETING USERS ***');
    console.log(error);
  }
};
