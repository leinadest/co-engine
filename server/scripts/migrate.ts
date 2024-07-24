import { type QueryInterface } from 'sequelize';
import { Umzug, SequelizeStorage, type UmzugOptions } from 'umzug';

import sequelize from '../src/config/sequelize';
import { NODE_ENV } from '../src/config/environment';

const runMigrations = async (
  command: 'up' | 'down' | string,
  customConfig?: UmzugOptions<QueryInterface>
): Promise<Umzug<QueryInterface>> => {
  await sequelize.authenticate();

  const defaultConfig: UmzugOptions<QueryInterface> = {
    migrations: { glob: 'migrations/*.postgres.ts' },
    context: sequelize.getQueryInterface(),
    storage: new SequelizeStorage({ sequelize, modelName: 'migrations' }),
    logger: console,
  };
  const migrator = new Umzug({ ...defaultConfig, ...customConfig });

  let migrationResult;
  switch (command) {
    case 'up':
      migrationResult = await migrator.up();
      break;
    case 'down':
      migrationResult = await migrator.down();
      break;
    default:
      console.log('Command must be "up" or "down"');
      process.exit(1);
  }

  const migrationsExecuted = migrationResult.map((mig) => mig.name);
  console.log(`Migrations successfully ${command}:`, migrationsExecuted);

  return migrator;
};

if (NODE_ENV !== 'test') {
  runMigrations(process.argv[2]).catch((err) => {
    console.log('Error running migrations', err);
  });
}

export default runMigrations;
