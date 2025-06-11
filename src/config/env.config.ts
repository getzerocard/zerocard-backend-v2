import * as dotenv from 'dotenv';

dotenv.config();

export const config = {
  app: {
    env: process.env.NODE_ENV,
    name: process.env.APP_NAME,
    port: process.env.PORT,
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  redis: {
    url: process.env.REDIS_URL,
  },
  smileid: {
    url: process.env.SMILEID_URL,
  },
  sudo: {
    url: process.env.SUDO_URL,
  },
} as const;
