import { Op } from 'sequelize';

import { NODE_ENV } from '../src/config/environment';
import { User } from '../src/resources';

const devData: { users: Array<Record<string, string>>; usersIds: number[] } = {
  users: [
    {
      username: 'tester',
      email: 'test@gmail.com',
      password_hash: 'test123',
    },
    {
      username: 'tester2',
      email: 'test2@gmail.com',
      password_hash: 'test123',
    },
  ],
  usersIds: [],
};

const prodData: typeof devData = {
  users: [{}],
  usersIds: [],
};

const data = NODE_ENV === 'development' ? devData : prodData;

export const up = async (): Promise<void> => {
  try {
    console.log('*** BULK INSERTING USERS... ***');

    const result = await User.bulkCreate(devData.users);
    data.usersIds = result.map((user) => user.id);

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
          id: {
            [Op.in]: data.usersIds,
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
