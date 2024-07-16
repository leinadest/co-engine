import { NODE_ENV } from '../src/config';
import Message from '../src/resources/message/model';

const devMessages = [
  {
    contextType: 'chat',
    contextId: 0,
    creatorId: 1,
    content: 'test content',
  },
  {
    contextType: 'channel',
    contextId: 0,
    creatorId: 2,
    content: 'test content 2',
    reactions: [{ reactorId: 0, reaction: 'test reaction' }],
  },
];

const prodMessages = [
  {
    contextType: '',
    contextId: 0,
    creatorId: 0,
    content: '',
  },
];

export const up = async (): Promise<void> => {
  try {
    console.log('*** BULK INSERTING MESSAGES... ***');
    const result = await Message.insertMany(
      NODE_ENV === 'development' ? devMessages : prodMessages
    );
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
    const result = await Message.deleteMany({});
    console.log('*** BULK DELETED MESSAGES RESULT ***');
    console.log(result);
  } catch (error: any) {
    console.log('*** ERROR DELETING MESSAGES ***');
    console.log(error);
  }
};
