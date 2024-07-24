import { NODE_ENV } from '../src/config/environment';
import Message from '../src/resources/message/model';

const devData: { messages: any[]; messagesIds: string[] } = {
  messages: [
    {
      context_type: 'chat',
      context_id: 0,
      creator_id: 1,
      content: 'test content',
    },
    {
      context_type: 'channel',
      context_id: 0,
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
