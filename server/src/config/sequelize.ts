import { type QueryInterface, Sequelize } from 'sequelize';
import { Umzug, SequelizeStorage, type UmzugOptions } from 'umzug';

import { NODE_ENV, POSTGRES_URL } from '.';

// const sequelize = new Sequelize(POSTGRES_URL, {
//   dialectOptions: {
//     ssl: {
//       require: true,
//       rejectUnauthorized: false,
//     },
//   },
// });

// TODO: Configure ssl
const sequelize = new Sequelize(POSTGRES_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  dialectOptions: {},
});

const migrationConf = {
  migrations: {
    glob: 'migrations/*.postgres.ts',
  },
  storage: new SequelizeStorage({ sequelize, modelName: 'migrations' }),
  context: sequelize.getQueryInterface(),
  logger: NODE_ENV === 'development' ? console : undefined,
};

const seedsConf = {
  migrations: {
    glob: 'seeds/*.postgres.ts',
  },
  storage: new SequelizeStorage({ sequelize, modelName: 'seeds' }),
  context: sequelize.getQueryInterface(),
  logger: NODE_ENV === 'development' ? console : undefined,
};

const runMigrations = async (
  migrationConf: UmzugOptions<QueryInterface>
): Promise<Umzug<QueryInterface>> => {
  const migrator = new Umzug(migrationConf);
  const migrations = await migrator.up();
  console.log('Migrations up to date', {
    files: migrations.map((mig) => mig.name),
  });
  return migrator;
};

const runSeeds = async (
  seedsConf: UmzugOptions<QueryInterface>
): Promise<Umzug<QueryInterface>> => {
  const seeder = new Umzug(seedsConf);
  const seeds = await seeder.up();
  console.log('Seeds up to date', {
    files: seeds.map((mig) => mig.name),
  });
  return seeder;
};

const rollbackMigration = async (
  migrationConf: UmzugOptions<QueryInterface>
): Promise<void> => {
  await sequelize.authenticate();
  const migrator = new Umzug(migrationConf);
  await migrator.down();
};

const rollbackSeeds = async (
  seedsConf: UmzugOptions<QueryInterface>
): Promise<void> => {
  await sequelize.authenticate();
  const seeder = new Umzug(seedsConf);
  await seeder.down();
};

const connectToPostgres = async (): Promise<any> => {
  try {
    await sequelize.authenticate();
    await runMigrations(migrationConf);
    await runSeeds(seedsConf);
    console.log('database connected');
  } catch (err: any) {
    console.log(`connecting database failed: ${err}`);
  }
  return null;
};

export {
  sequelize,
  runMigrations,
  runSeeds,
  rollbackMigration,
  rollbackSeeds as rollBackSeeds,
  connectToPostgres,
};
