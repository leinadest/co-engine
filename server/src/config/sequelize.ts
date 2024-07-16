import { Sequelize } from 'sequelize';
import { Umzug, SequelizeStorage } from 'umzug';
import { POSTGRES_URL } from '.';

// const sequelize = new Sequelize(POSTGRES_URL, {
//   dialectOptions: {
//     ssl: {
//       require: true,
//       rejectUnauthorized: false,
//     },
//   },
// });

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
  logger: console,
};

const runMigrations = async (): Promise<void> => {
  const migrator = new Umzug(migrationConf);
  const migrations = await migrator.up();
  console.log('Migrations up to date', {
    files: migrations.map((mig) => mig.name),
  });
};

const seedsConf = {
  migrations: {
    glob: 'seeds/*.postgres.ts',
  },
  storage: new SequelizeStorage({ sequelize, modelName: 'seeds' }),
  context: sequelize.getQueryInterface(),
  logger: console,
};

const runSeeds = async (): Promise<void> => {
  const seeder = new Umzug(seedsConf);
  const seeds = await seeder.up();
  console.log('Seeds up to date', {
    files: seeds.map((mig) => mig.name),
  });
};

const rollbackMigration = async (): Promise<void> => {
  await sequelize.authenticate();
  const migrator = new Umzug(migrationConf);
  await migrator.down();
};

const connectToPostgres = async (): Promise<any> => {
  try {
    import('../resources');
    await sequelize.authenticate();
    await runMigrations();
    await runSeeds();
    console.log('database connected');
  } catch (err: any) {
    console.log(`connecting database failed: ${err}`);
  }

  return null;
};

export { sequelize, rollbackMigration, connectToPostgres };
