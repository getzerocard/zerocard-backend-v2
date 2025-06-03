import * as dotenv from 'dotenv';

dotenv.config();

const config = {
  app: {
    env: process.env.NODE_ENV || 'local',
    name: process.env.APP_NAME || 'zerocard',
    port: process.env.PORT || 3000,
  },
  database: {
    url: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/zerocard',
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  privy: {
    apiKey: process.env.PRIVY_API_KEY,
    apiSecret: process.env.PRIVY_API_SECRET,
    authorizationPrivateKey: process.env.PRIVY_AUTHORIZATION_PRIVATE_KEY,
  },
};

export default config;
