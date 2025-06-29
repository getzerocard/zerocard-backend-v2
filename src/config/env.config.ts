import * as dotenv from 'dotenv';

dotenv.config();

export const config = {
  app: {
    env: process.env.APP_ENV,
    name: process.env.APP_NAME,
    port: process.env.APP_PORT,
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    accessExpiry: process.env.JWT_ACCESS_EXPIRY,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY,
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  redis: {
    url: process.env.REDIS_URL,
  },
  smileid: {
    url: process.env.SMILEID_URL,
    apiKey: process.env.SMILEID_API_KEY,
    partnerId: process.env.SMILEID_PARTNER_ID,
  },
  blockradar: {
    apiKey: process.env.BLOCKRADAR_API_KEY,
  },
  sudo: {
    url: process.env.SUDO_URL,
    apiKey: process.env.SUDO_API_KEY,
    authorizationSecret: process.env.SUDO_AUTHORIZATION_SECRET,
    fundingSourceId: process.env.SUDO_FUNDING_SOURCE_ID,
  },
} as const;
