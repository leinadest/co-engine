import { type QueryInterface } from 'sequelize';
import { Umzug, SequelizeStorage, type UmzugOptions } from 'umzug';

import { sequelize } from '../src/config/sequelize';
import connectToMongo from '../src/config/mongo';
import { NODE_ENV } from '../src/config/environment';
import mongoose from 'mongoose';

const runSeeds = async (
  command: 'up' | 'down' | string,
  customConfig?: UmzugOptions<QueryInterface>
): Promise<Umzug<QueryInterface>> => {
  await Promise.all([connectToMongo(), sequelize.authenticate()]);

  const defaultConfig: UmzugOptions<QueryInterface> = {
    migrations: { glob: 'seeds/*.ts' },
    context: sequelize.getQueryInterface(),
    storage: new SequelizeStorage({ sequelize, modelName: 'seeds' }),
    logger: console,
  };
  const seeder = new Umzug({ ...defaultConfig, ...customConfig });

  let seedResult;
  switch (command) {
    case 'up':
      seedResult = await seeder.up();
      break;
    case 'down':
      seedResult = await seeder.down();
      break;
    default:
      console.log('Command must be "up" or "down"');
      process.exit(1);
  }

  const seedsExecuted = seedResult.map((seed) => seed.name);
  console.log(`Seeds successfully ${command}:`, seedsExecuted);

  return seeder;
};

if (NODE_ENV !== 'test') {
  runSeeds(process.argv[2])
    .catch((err) => {
      console.error('Error running seeds', err);
    })
    .finally(() => {
      mongoose.disconnect().catch((err) => {
        console.error('Error disconnecting from MongoDB', err);
      });
    });
}

export default runSeeds;
