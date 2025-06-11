export const AUTH_CONSTANTS = {
  MAX_LOGIN_ATTEMPTS: 5,
  TOKEN_TYPES: {
    ACCESS: 'access',
    REFRESH: 'refresh',
  },
  SESSION: {
    TTL_DAYS: 14,
  },
  COOKIE: {
    REFRESH_TOKEN_KEY: 'refreshToken',
    OPTIONS: {
      httpOnly: true,
      path: '/',
      priority: 'high',
    },
  },
} as const;

export const JWT_BLACKLIST_PREFIX = 'jwt_blacklist_';
