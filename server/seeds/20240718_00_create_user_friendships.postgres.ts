/* eslint-disable @typescript-eslint/naming-convention */
import { Op } from 'sequelize';

import { NODE_ENV } from '../src/config';
import UserFriendship from '../src/resources/user_friendship/model';

const devFriendships = [
  {
    sender_id: 1,
    receiver_id: 2,
  },
];

const prodFriendships = [{}];

export const up = async (): Promise<void> => {
  try {
    console.log('*** BULK INSERTING USER FRIENDSHIPS... ***');
    const result = await UserFriendship.bulkCreate(
      NODE_ENV === 'development' ? devFriendships : prodFriendships
    );
    console.log(`*** BULK INSERTED USER FRIENDSHIPS RESULT ***`);
    console.log(result);
  } catch (error: any) {
    console.log('*** ERROR INSERTING USER FRIENDSHIPS ***');
    console.log(error);
  }
};

export const down = async (): Promise<void> => {
  try {
    console.log('*** BULK DELETING USER FRIENDSHIPS... ***');
    const result = await UserFriendship.destroy({
      where: {
        sender_id: {
          [Op.in]: devFriendships.map(({ sender_id }) => sender_id),
        },
      },
    });
    console.log('*** BULK DELETED USER FRIENDSHIPS RESULT ***');
    console.log(result);
  } catch (error: any) {
    console.log('*** ERROR DELETING USER FRIENDSHIPS ***');
    console.log(error);
  }
};
