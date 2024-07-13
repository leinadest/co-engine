import { type Connection } from 'mongoose';

import { NODE_ENV } from '../src/utils/config';
import Message from '../src/resources/messages/model';

const testMessages = [
  {
    contextType: 'chat',
    contextId: 0,
    creatorId: 0,
    content: 'test content',
  },
  {
    contextType: 'channel',
    contextId: 0,
    creatorId: 1,
    content: 'test content 2',
    reactions: [{ reactorId: 0, reaction: 'test reaction' }],
  },
];

interface Params {
  context: Connection;
}

export const up = async ({ context }: Params): Promise<void> => {
  try {
    if (NODE_ENV === 'development') {
      console.log('*** BULK INSERTING MESSAGES... ***');
      const result = await Message.insertMany(testMessages);
      console.log(`*** BULK INSERTED MESSAGES RESULT ***`);
      console.log(result);
    }
  } catch (error: any) {
    console.log('*** ERROR INSERTING MESSAGES ***');
    console.log(error);
  }
};

export const down = async ({ context: conn }: Params): Promise<void> => {
  try {
    if (NODE_ENV === 'development') {
      console.log('*** BULK DELETING MESSAGES... ***');
      const result = await Message.deleteMany();
      console.log('*** BULK DELETED MESSAGES RESULT ***');
      console.log(result);
    }
  } catch (error: any) {
    console.log('*** ERROR DELETING MESSAGES ***');
    console.log(error);
  }
};
