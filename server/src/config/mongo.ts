import mongoose, { type Connection } from 'mongoose';
import { MongoDBStorage, Umzug, type UmzugOptions } from 'umzug';

import { MONGO_URL, NODE_ENV } from './environment';

const seedsConf = (connection: Connection): UmzugOptions<object> => ({
  migrations: {
    glob: 'seeds/*.mongo.ts',
  },
  storage: new MongoDBStorage({ connection }),
  context: connection,
  logger: NODE_ENV === 'development' ? console : undefined,
});

const runSeeds = async (connection: Connection): Promise<void> => {
  const seeder = new Umzug(seedsConf(connection));
  const seeds = await seeder.up();
  console.log('Seeds up to date', {
    files: seeds.map((mig) => mig.name),
  });
};

const rollback = async (connection: Connection): Promise<void> => {
  const seeder = new Umzug(seedsConf(connection));
  await seeder.down();
};

const connectToMongo = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGO_URL);
    console.log('Connected to MongoDB');
    if (NODE_ENV !== 'test') {
      await runSeeds(mongoose.connection);
    }
  } catch (error: any) {
    console.log('Error connection to MongoDB:', error);
  }
};

export { connectToMongo, rollback };
