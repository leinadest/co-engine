import { type QueryInterface, DataTypes } from 'sequelize';
import { SequelizeStorage, type UmzugOptions } from 'umzug';

import {
  rollbackMigration,
  rollBackSeeds,
  runMigrations,
  runSeeds,
  sequelize,
} from '../../src/config/sequelize';

describe('Sequelize Integration Tests', () => {
  let migrationConf: UmzugOptions<QueryInterface>;
  let seedsConf: UmzugOptions<QueryInterface>;

  beforeAll(async () => {
    await sequelize.authenticate();
    migrationConf = {
      migrations: [],
      context: sequelize.getQueryInterface(),
      storage: new SequelizeStorage({ sequelize, modelName: 'migrations' }),
      logger: undefined,
    };
    seedsConf = {
      ...migrationConf,
      storage: new SequelizeStorage({ sequelize, modelName: 'seeds' }),
    };
  });

  beforeEach(async () => {
    await sequelize.getQueryInterface().dropAllTables();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('should run and rollback migrations and seeds successfully', async () => {
    // Set up test data
    migrationConf.migrations = [
      {
        name: '1_create_users_table',
        up: async ({ context: queryInterface }) => {
          await queryInterface.createTable('users', {
            id: {
              type: DataTypes.INTEGER,
              primaryKey: true,
              autoIncrement: true,
            },
            username: {
              type: DataTypes.STRING,
              allowNull: false,
            },
          });
        },
        down: async ({ context: queryInterface }) => {
          await queryInterface.dropTable('users');
        },
      },
    ];
    seedsConf.migrations = [
      {
        name: '1_create_users',
        up: async ({ context: queryInterface }) => {
          await queryInterface.bulkInsert('users', [
            { username: 'test_username' },
          ]);
        },
        down: async ({ context: queryInterface }) =>
          await queryInterface.bulkDelete('users', {
            username: 'test_username',
          }),
      },
    ];
    const queryInterface = sequelize.getQueryInterface();

    // Run migrations and seeds

    await runMigrations(migrationConf);
    await runSeeds(seedsConf);

    const tables = await queryInterface.showAllTables();
    const user = await queryInterface.select(null, 'users', {
      where: { username: 'test_username' },
    });

    // Run seed rollback
    await rollBackSeeds(seedsConf);
    const userAfterRollback = await queryInterface.select(null, 'users', {
      where: { username: 'test_username' },
    });

    // Run migration rollback
    await rollbackMigration(migrationConf);
    const tablesAfterRollback = await sequelize
      .getQueryInterface()
      .showAllTables();

    // Assert
    expect(tables).toContain('users');
    expect(user).toContainEqual({ id: 1, username: 'test_username' });
    expect(userAfterRollback).not.toContainEqual({
      id: 1,
      username: 'test_username',
    });
    expect(tablesAfterRollback).not.toContain('users');
  });
});
