import { Sequelize } from 'sequelize';

let sequelize: Sequelize;

export const connectToPostgres = async (): Promise<void> => {
  if (sequelize) {
    return;
  }
  sequelize = new Sequelize(process.env.POSTGRES_URL as string, {
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {},
    logging: false,
  });
  await sequelize.authenticate();
  console.log('Connected to PostgreSQL');
};

export const getSequelize = (): Sequelize => sequelize;
