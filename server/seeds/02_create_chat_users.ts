/* eslint-disable @typescript-eslint/naming-convention */
import { Op } from 'sequelize';

import { NODE_ENV } from '../src/config/environment';
import { ChatUser } from '../src/resources';

const devData: { chatUsers: any[]; chatUsersIds: number[] } = {
  chatUsers: [
    ...Array.from({ length: 10 }, (_, i) => ({
      user_id: i + 1,
      chat_id: i + 1,
    })),
    ...Array.from({ length: 50 }, (_, i) => ({
      user_id: 1,
      chat_id: i + 2,
    })),
    ...Array.from({ length: 50 }, (_, i) => ({
      user_id: i + 2,
      chat_id: 1,
    })),
  ],
  chatUsersIds: [],
};

const prodData: typeof devData = {
  chatUsers: [
    ...Array.from({ length: 10 }, (_, i) => ({
      user_id: 1,
      chat_id: i + 1,
    })),
    ...Array.from({ length: 9 }, (_, i) => ({
      user_id: i + 2,
      chat_id: i + 2,
    })),
    ...Array.from({ length: 9 }, (_, i) => ({
      user_id: i + 2,
      chat_id: 1,
    })),
  ],
  chatUsersIds: [],
};

const data = NODE_ENV === 'development' ? devData : prodData;

export const up = async (): Promise<void> => {
  try {
    console.log('*** BULK INSERTING CHAT USERS... ***');

    const result = await ChatUser.bulkCreate(data.chatUsers);
    data.chatUsersIds = result.map((chatUser) => chatUser.user_id);

    console.log(`*** BULK INSERTED CHAT USERS RESULT ***`);
    console.log(result);
  } catch (error: any) {
    console.log('*** ERROR INSERTING CHAT USERS ***');
    console.log(error);
  }
};

export const down = async (): Promise<void> => {
  try {
    console.log('*** BULK DELETING CHAT USERS... ***');

    const result = await ChatUser.destroy({
      where: {
        user_id: {
          [Op.in]: data.chatUsersIds,
        },
      },
    });

    console.log('*** BULK DELETED CHAT USERS RESULT ***');
    console.log(result);
  } catch (error: any) {
    console.log('*** ERROR DELETING CHAT USERS ***');
    console.log(error);
  }
};
