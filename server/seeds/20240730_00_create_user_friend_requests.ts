/* eslint-disable @typescript-eslint/naming-convention */
import { Op } from 'sequelize';

import { NODE_ENV } from '../src/config/environment';
import { UserFriendRequest } from '../src/resources';

const devData: { userFriendRequests: any[]; userFriendRequestsIds: number[] } =
  {
    userFriendRequests: [
      {
        sender_id: 1,
        receiver_id: 2,
      },
    ],
    userFriendRequestsIds: [],
  };

const prodData: typeof devData = {
  userFriendRequests: [{}],
  userFriendRequestsIds: [],
};

const data = NODE_ENV === 'development' ? devData : prodData;

export const up = async (): Promise<void> => {
  try {
    console.log('*** BULK INSERTING USER FRIEND REQUESTS... ***');

    const result = await UserFriendRequest.bulkCreate(data.userFriendRequests);
    data.userFriendRequestsIds = result.map(
      (userFriendship) => userFriendship.sender_id
    );

    console.log(`*** BULK INSERTED USER FRIEND REQUESTS RESULT ***`);
    console.log(result);
  } catch (error: any) {
    console.log('*** ERROR INSERTING USER FRIEND REQUESTS ***');
    console.log(error);
  }
};

export const down = async (): Promise<void> => {
  try {
    console.log('*** BULK DELETING USER FRIEND REQUESTS... ***');

    const result = await UserFriendRequest.destroy({
      where: {
        sender_id: {
          [Op.in]: data.userFriendRequestsIds,
        },
      },
    });

    console.log('*** BULK DELETED USER FRIEND REQUESTS RESULT ***');
    console.log(result);
  } catch (error: any) {
    console.log('*** ERROR DELETING USER FRIEND REQUESTS ***');
    console.log(error);
  }
};
