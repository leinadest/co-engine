import bcrypt from 'bcrypt';
import { Op } from 'sequelize';

import { NODE_ENV } from '../src/config';
import User from '../src/resources/user/model';

const createPasswordHash = async (password: string): Promise<string> =>
  await bcrypt.hash(password, 10);

const createUser = async ({
  username,
  email,
  password,
}: {
  username: string;
  email: string;
  password: string;
}): Promise<any> => {
  return {
    username,
    email,
    password_hash: await createPasswordHash(password),
  };
};

const devUsersDetails = [
  {
    username: 'tester',
    email: 'test@gmail.com',
    password: 'test123',
  },
  {
    username: 'tester2',
    email: 'test2@gmail.com',
    password: 'test123',
  },
];

const prodUsersDetails = [{ username: '', email: '', password: '' }];

export const up = async (): Promise<void> => {
  try {
    const users = await Promise.all(
      NODE_ENV === 'development'
        ? devUsersDetails.map(async (details) => await createUser(details))
        : prodUsersDetails.map(async (details) => await createUser(details))
    );
    console.log('*** BULK INSERTING USERS... ***');
    const result = await User.bulkCreate(users);
    console.log(`*** BULK INSERTED USERS RESULT ***`);
    console.log(result);
  } catch (error: any) {
    console.log('*** ERROR INSERTING USERS ***');
    console.log(error);
  }
};

export const down = async (): Promise<void> => {
  try {
    if (NODE_ENV === 'development') {
      console.log('*** BULK DELETING USERS... ***');
      const result = await User.destroy({
        where: {
          username: {
            [Op.in]: devUsersDetails.map(({ username }) => username),
          },
        },
      });
      console.log('*** BULK DELETED USERS RESULT ***');
      console.log(result);
    }
  } catch (error: any) {
    console.log('*** ERROR DELETING USERS ***');
    console.log(error);
  }
};
