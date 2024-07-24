import mongoose from 'mongoose';

import { MONGO_URL } from './environment';

const connectToMongo = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGO_URL);
    console.log('Connected to MongoDB');
  } catch (error: any) {
    console.log('Error connection to MongoDB:', error);
  }
};

export default connectToMongo;
