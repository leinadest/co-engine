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

const connectToPostgres = async (): Promise<any> => {
  try {
    await sequelize.authenticate();
    console.log('database connected');
  } catch (err: any) {
    console.log(`connecting database failed: ${err}`);
  }
  return null;
};

export { sequelize, connectToPostgres };
