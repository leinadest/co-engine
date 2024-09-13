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
let sequelize = new Sequelize(POSTGRES_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  dialectOptions: {},
});

export const connectToPostgres = async (): Promise<void> => {
  try {
    sequelize = new Sequelize(POSTGRES_URL, {
      dialect: 'postgres',
      protocol: 'postgres',
      dialectOptions: {},
    });
    await sequelize.authenticate();
    console.log('Connected to PostgreSQL');
  } catch (error: any) {
    console.log('Error connection to PostgreSQL:', error);
    setTimeout(() => {
      void connectToPostgres();
    }, 5000);
  }
};

export default sequelize;
