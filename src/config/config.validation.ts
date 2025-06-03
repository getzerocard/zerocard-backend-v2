import Joi from 'joi';

export const configValidationSchema = Joi.object({
  APP_ENV: Joi.string().required(),
  APP_NAME: Joi.string().required(),
  APP_PORT: Joi.number().required(),
  DATABASE_URL: Joi.string().required(),
  REDIS_URL: Joi.string().required(),
  PRIVY_API_KEY: Joi.string().required(),
  PRIVY_API_SECRET: Joi.string().required(),
  PRIVY_AUTHORIZATION_PRIVATE_KEY: Joi.string().required(),
});
