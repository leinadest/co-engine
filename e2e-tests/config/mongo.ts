import mongoose from 'mongoose';

export const connectToMongo = async (): Promise<void> => {
  if (mongoose.connection.readyState === 1) {
    return;
  }
  await mongoose.connect(process.env.MONGO_URL as string);
  console.log('Connected to MongoDB');
};

export default mongoose;
