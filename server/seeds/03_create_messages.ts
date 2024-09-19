import { NODE_ENV } from '../src/config/environment';
import { Message } from '../src/resources';

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
  messages: [
    "Hey, how's it going?",
    "I'm doing well, thanks. How about you?",
    "I'm good. I was thinking about our weekend plans. Do you have any good ideas for what we could do?",
    "I've beeing thinking we could either go hiking or maybe check out that new cafe downtown. What do you think?",
    "Both sound great! I've been wanting to try that cafe. But if the weather is nice, hiking would be awesome too.",
    'True, the weather has been great lately. How about we keep it flexible? We can decide on Saturday morning based on the weather.',
    'Sounds like a plan. Do you want to meet at the café first thing, or should we check the weather and then decide?',
    "Let's check the weather in the morning and decide. If we go to the café, maybe we could meet there at 10 AM?",
    "Perfect. I'll check the weather first thing and text you around 9 AM.",
    "Great! I'll keep my phone handy. Looking forward to it!",
  ].map((msg, i) => ({
    context_type: 'chat',
    context_id: '2',
    creator_id: i % 2 === 0 ? 1 : 2,
    content: msg,
  })),
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
