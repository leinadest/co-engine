import { NODE_ENV } from '../src/config/environment';
import Message from '../src/resources/message/model';

const devData: { messages: any[]; messagesIds: string[] } = {
  messages: [
    ...Array.from({ length: 10 }, (_, i) => ({
      context_type: 'chat',
      context_id: 1,
      creator_id: (i % 2) + 1,
      content:
        i % 2 === 0 && i % 4 !== 0
          ? 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum'
          : 'Lorem ipsum odor amet, consectetuer adipiscing elit',
    })),
    {
      context_type: 'channel',
      context_id: 1,
      creator_id: 2,
      content: 'test content 2',
      reactions: [{ reactor_id: 0, reaction: 'test reaction' }],
    },
  ],
  messagesIds: [],
};

const prodData: typeof devData = {
  messages: [{}],
  messagesIds: [],
};

const data = NODE_ENV === 'development' ? devData : prodData;

export const up = async (): Promise<void> => {
  try {
    console.log('*** BULK INSERTING MESSAGES... ***');

    const result = await Message.insertMany(data.messages);
    data.messagesIds = result.map((message) => message.id);

    console.log(`*** BULK INSERTED MESSAGES RESULT ***`);
    console.log(result);
  } catch (error: any) {
    console.log('*** ERROR INSERTING MESSAGES ***');
    console.log(error);
  }
};

export const down = async (): Promise<void> => {
  try {
    console.log('*** BULK DELETING MESSAGES... ***');

    const result = await Message.deleteMany({ _id: data.messagesIds });

    console.log('*** BULK DELETED MESSAGES RESULT ***');
    console.log(result);
  } catch (error: any) {
    console.log('*** ERROR DELETING MESSAGES ***');
    console.log(error);
  }
};
