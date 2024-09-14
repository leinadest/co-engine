import { Op } from 'sequelize';

import { NODE_ENV } from '../src/config/environment';
import Chat from '../src/resources/chat/model';

const getTimeAgo = (
  num: number,
  unit: 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years'
): Date => {
  const msMap = {
    seconds: 1000,
    minutes: 60 * 1000,
    hours: 60 * 60 * 1000,
    days: 60 * 60 * 24 * 1000,
    weeks: 60 * 60 * 24 * 7 * 1000,
    months: 60 * 60 * 24 * 30 * 1000,
    years: 60 * 60 * 24 * 365 * 1000,
  };
  return new Date(Date.now() - num * msMap[unit]);
};

const devData: { chats: any[]; chatsIds: number[] } = {
  chats: [
    ...Array.from({ length: 100 }, (_, i) => ({
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
  chats: [
    {
      creator_id: 1,
      last_message_at: new Date(),
      last_message: "Wouldn't think it would be that easy.",
    },
    {
      creator_id: 1,
      last_message_at: getTimeAgo(5, 'minutes'),
      last_message: "Great! I'll keep my phone handy. Looking forward to it!",
    },
    {
      creator_id: 1,
      last_message_at: getTimeAgo(7, 'minutes'),
      last_message: 'Looking forward to it.',
    },
    {
      creator_id: 1,
      last_message_at: getTimeAgo(2, 'hours'),
      last_message: 'Maybe next week.',
    },
    {
      creator_id: 1,
      last_message_at: getTimeAgo(3, 'hours'),
      last_message: 'Ah, that sounds good.',
    },
    {
      creator_id: 1,
      last_message_at: getTimeAgo(3, 'hours'),
      last_message: "I'm on my way.",
    },
    {
      creator_id: 1,
      last_message_at: getTimeAgo(1, 'days'),
      last_message: "Well, let's hope it works out.",
    },
    {
      creator_id: 1,
      last_message_at: getTimeAgo(1, 'days'),
      last_message: 'Not yet.',
    },
    {
      creator_id: 1,
      last_message_at: getTimeAgo(2, 'days'),
      last_message: "I'll check it out.",
    },
    {
      creator_id: 1,
      last_message_at: getTimeAgo(1, 'weeks'),
      last_message: 'Sounds good.',
    },
    {
      creator_id: 1,
      last_message_at: getTimeAgo(17, 'years'),
      last_message: 'alright see u tmr!',
    },
  ],
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
