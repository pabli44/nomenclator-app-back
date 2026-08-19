import * as Joi from 'joi';

const DATABASE_GROUP = ['DB_HOST', 'DB_PORT', 'DB_USERNAME', 'DB_PASSWORD', 'DB_NAME'];

export const envValidationSchema = Joi.object({
  PORT: Joi.number().default(3000),
  // Neon url mode (runtime pooled + migrations direct). At least one DB source
  // must be configured: either DATABASE_URL or the full DB_* group.
  DATABASE_URL: Joi.string().uri({ scheme: ['postgres', 'postgresql'] }).optional(),
  DIRECT_DATABASE_URL: Joi.string().uri({ scheme: ['postgres', 'postgresql'] }).optional(),
  DATABASE_URL_DIRECT: Joi.string().uri({ scheme: ['postgres', 'postgresql'] }).optional(),
  DB_HOST: Joi.string().optional(),
  DB_PORT: Joi.number().default(5432).optional(),
  DB_USERNAME: Joi.string().optional(),
  DB_PASSWORD: Joi.string().optional(),
  DB_NAME: Joi.string().optional(),
  // Vercel always sets NODE_ENV=production, even on previews; use VERCEL_ENV to
  // discriminate environments (e.g. Swagger gating).
  NODE_ENV: Joi.string().optional(),
  VERCEL_ENV: Joi.string().valid('production', 'preview', 'development').optional(),
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRATION: Joi.string().default('7d'),
}).custom((value, helpers) => {
  const hasUrl = Boolean(value.DATABASE_URL);
  const hasDatabaseGroup = DATABASE_GROUP.every(
    (key) => value[key] !== undefined && value[key] !== '',
  );

  if (!hasUrl && !hasDatabaseGroup) {
    return helpers.error('any.custom', {
      message:
        'Provide either DATABASE_URL (Neon pooled) or the DB_HOST/DB_PORT/DB_USERNAME/DB_PASSWORD/DB_NAME group',
    });
  }

  return value;
});