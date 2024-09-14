import { Op } from 'sequelize';

import { NODE_ENV } from '../src/config/environment';
import { UserFriendship } from '../src/resources';

const devData: { userFriendships: any[]; userFriendshipsIds: number[] } = {
  userFriendships: [
    ...Array.from({ length: 30 }, (_, i) => ({
      user_id: 1,
      friend_id: i + 62,
    })),
    ...Array.from({ length: 30 }, (_, i) => ({
      user_id: i + 62,
      friend_id: 1,
    })),
  ],
  userFriendshipsIds: [],
};

const prodData: typeof devData = {
  userFriendships: [
    ...Array.from({ length: 9 }, (_, i) => ({
      user_id: 1,
      friend_id: i + 2,
    })),
    ...Array.from({ length: 9 }, (_, i) => ({
      user_id: i + 2,
      friend_id: 1,
    })),
  ],
  userFriendshipsIds: [],
};

const data = NODE_ENV === 'development' ? devData : prodData;

export const up = async (): Promise<void> => {
  try {
    console.log('*** BULK INSERTING USER FRIENDSHIPS... ***');

    const result = await UserFriendship.bulkCreate(data.userFriendships);
    data.userFriendshipsIds = result.map(
      (userFriendship) => userFriendship.user_id
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
        user_id: {
          [Op.in]: data.userFriendshipsIds,
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
