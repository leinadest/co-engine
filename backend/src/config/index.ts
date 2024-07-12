import dotenv from 'dotenv';

if ('error' in dotenv.config()) {
  throw new Error('Could not find .env');
}

export default {
  port: process.env.PORT ?? '3000',
};
