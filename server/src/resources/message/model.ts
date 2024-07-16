import mongoose from 'mongoose';
import { DateTime } from 'luxon';

const MessageSchema = new mongoose.Schema({
  contextType: { type: String, required: true },
  contextId: { type: Number, required: true },
  creatorId: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  content: { type: String, required: true, maxLength: 10000 },
  reactions: [{ reactorId: Number, reaction: String }],
});

MessageSchema.set('toJSON', {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    returnedObject.formattedCreatedAt = DateTime.fromJSDate(
      returnedObject.createdAt as Date
    ).toLocaleString(DateTime.DATETIME_MED);
    returnedObject.formattedUpdatedAt = DateTime.fromJSDate(
      returnedObject.updatedAt as Date
    ).toLocaleString(DateTime.DATETIME_MED);

    delete returnedObject.__v;
    delete returnedObject._id;
    delete returnedObject.createdAt;
    delete returnedObject.updatedAt;
  },
});

export default mongoose.model('Message', MessageSchema);
