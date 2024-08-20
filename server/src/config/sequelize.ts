import { Sequelize } from 'sequelize';

import { POSTGRES_URL } from './environment';

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

export const verifySequelizeConnection = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('Connected to PostgreSQL');
  } catch (error: any) {
    console.log('Error connection to PostgreSQL:', error);
  }
};

export default sequelize;
