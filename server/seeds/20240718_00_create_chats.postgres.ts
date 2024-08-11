/* eslint-disable @typescript-eslint/naming-convention */
import { Op } from 'sequelize';

import { NODE_ENV } from '../src/config/environment';
import Chat from '../src/resources/chat/model';

const devData: { chats: any[]; chatsIds: number[] } = {
  chats: [
    ...Array.from({ length: 10 }, (_, i) => ({
      name: `test${i}`,
      creator_id: i + 1,
      last_message_at: new Date(),
      last_message:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation',
    })),
  ],
  chatsIds: [],
};

const prodData: typeof devData = {
  chats: [{}],
  chatsIds: [],
};

const data = NODE_ENV === 'development' ? devData : prodData;

export const up = async (): Promise<void> => {
  try {
    console.log('*** BULK INSERTING CHATS... ***');

    const result = await Chat.bulkCreate(data.chats);
    data.chatsIds = result.map((chat) => chat.id);

    console.log(`*** BULK INSERTED CHATS RESULT ***`);
    console.log(result);
  } catch (error: any) {
    console.log('*** ERROR INSERTING CHATS ***');
    console.log(error);
  }
};

export const down = async (): Promise<void> => {
  try {
    console.log('*** BULK DELETING CHATS... ***');

    const result = await Chat.destroy({
      where: {
        id: {
          [Op.in]: data.chatsIds,
        },
      },
    });

    console.log('*** BULK DELETED CHATS RESULT ***');
    console.log(result);
  } catch (error: any) {
    console.log('*** ERROR DELETING CHATS ***');
    console.log(error);
  }
};
