import mongoose from 'mongoose';
import { DateTime } from 'luxon';

const MessageSchema = new mongoose.Schema({
  context_type: { type: String, required: true },
  context_id: { type: Number, required: true },
  creator_id: { type: Number, required: true },
  created_at: { type: Date, default: Date.now },
  edited_at: { type: Date, default: null },
  content: { type: String, required: true, maxLength: 10000 },
  reactions: { type: [{ reactor_id: Number, reaction: String }], default: [] },
});

MessageSchema.set('toJSON', {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();

    const formatDate = (obj: any, prop: string): void => {
      if (obj[prop] === null) return;
      obj[`formatted_${prop}`] = DateTime.fromJSDate(
        obj[prop] as Date
      ).toLocaleString(DateTime.DATETIME_MED);
    };
    formatDate(returnedObject, 'created_at');
    formatDate(returnedObject, 'edited_at');

    delete returnedObject.__v;
    delete returnedObject._id;
    delete returnedObject.created_at;
    delete returnedObject.edited_at;
  },
});

export interface IMessage
  extends mongoose.Document<unknown, Record<string, unknown>, IMessage> {
  id: string;
  context_type: string;
  context_id: number;
  creator_id: number;
  created_at: Date;
  edited_at: Date | null;
  content: string;
  reactions: Array<{ reactor_id: string; reaction: string }>;
}

export interface IMessageJSON
  extends Omit<IMessage, 'created_at' | 'edited_at'> {
  formatted_created_at: string;
  formatted_edited_at: string | null;
}

const Message = mongoose.model<IMessage>('Message', MessageSchema);

export default Message;
