import { QueryTypes } from 'sequelize';
import { test as setup } from '@playwright/test';

import { connectToPostgres, getSequelize } from '../config/sequelize';
import { connectToMongo } from '../config/mongo';

const retryUntilSuccess = (
  cb: () => Promise<any>,
  ms: number
): Promise<void> => {
  return new Promise((resolve) => {
    const attempt = () => {
      cb()
        .then(() => {
          resolve(); // Success, resolve the outer promise
        })
        .catch((error: any) => {
          console.log(
            `${
              error.message ? `Error: ${error.message}` : error
            }. Retrying in ${ms / 1000} seconds...`
          );
          setTimeout(attempt, ms); // Retry after delay
        });
    };

    attempt(); // Initial call
  });
};

const verifyMigrationsAndSeed = async (): Promise<void> => {
  const sequelize = getSequelize();
  if (!sequelize) {
    throw new Error('Sequelize instance not found');
  }

  const migrations = await sequelize.query('SELECT * FROM migrations', {
    type: QueryTypes.SELECT,
    logging: false,
  });
  if (migrations.length < 7) {
    throw new Error('missing migrations');
  }

  const seeds = await sequelize.query('SELECT * FROM seeds', {
    type: QueryTypes.SELECT,
    logging: false,
  });
  if (seeds.length < 7) {
    throw new Error('missing seeds');
  }

  console.log('Migrations and seeds are ready');
};

setup('set up connections and wait for migrations', async () => {
  setup.setTimeout(300000);
  await retryUntilSuccess(connectToPostgres, 5000);
  await retryUntilSuccess(connectToMongo, 5000);
  await retryUntilSuccess(verifyMigrationsAndSeed, 5000);
});
