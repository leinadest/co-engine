import { test as teardown } from '@playwright/test';
import mongoose from '../config/mongo';

import { getSequelize } from '../config/sequelize';

teardown('disconnect from databases', () => {
  mongoose.disconnect();
  getSequelize()?.close();
  console.log('Disconnected from databases');
});
