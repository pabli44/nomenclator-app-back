import { envValidationSchema } from './env.validation';

describe('env validation schema', () => {
  const base = { JWT_SECRET: 'test-secret' };

  it('accepts Neon url mode without the DB_* group', () => {
    const { error } = envValidationSchema.validate({
      ...base,
      DATABASE_URL: 'postgres://user:pass@pooler.neon.tech/db',
      DIRECT_DATABASE_URL: 'postgres://user:pass@direct.neon.tech/db',
    });
    expect(error).toBeUndefined();
  });

  it('accepts the DATABASE_URL_DIRECT alias for migrations', () => {
    const { error } = envValidationSchema.validate({
      ...base,
      DATABASE_URL: 'postgres://user:pass@pooler.neon.tech/db',
      DATABASE_URL_DIRECT: 'postgres://user:pass@direct.neon.tech/db',
    });
    expect(error).toBeUndefined();
  });

  it('accepts the local DB_* group when no URL is set', () => {
    const { error } = envValidationSchema.validate({
      ...base,
      DB_HOST: 'localhost',
      DB_PORT: 5433,
      DB_USERNAME: 'postgres',
      DB_PASSWORD: 'postgres',
      DB_NAME: 'nomenclator_db',
    });
    expect(error).toBeUndefined();
  });

  it('rejects configs with neither a URL nor the DB_* group', () => {
    const { error } = envValidationSchema.validate({ ...base });
    expect(error).toBeDefined();
  });

  it('rejects an unknown VERCEL_ENV value', () => {
    const { error } = envValidationSchema.validate({
      ...base,
      DATABASE_URL: 'postgres://user:pass@pooler.neon.tech/db',
      VERCEL_ENV: 'staging',
    });
    expect(error).toBeDefined();
  });

  it.each(['production', 'preview', 'development'])(
    'accepts VERCEL_ENV=%s',
    (vercelEnv) => {
      const { error } = envValidationSchema.validate({
        ...base,
        DATABASE_URL: 'postgres://user:pass@pooler.neon.tech/db',
        VERCEL_ENV: vercelEnv,
      });
      expect(error).toBeUndefined();
    },
  );

  it('keeps requiring JWT_SECRET', () => {
    const { error } = envValidationSchema.validate({
      DATABASE_URL: 'postgres://user:pass@pooler.neon.tech/db',
    });
    expect(error).toBeDefined();
  });
});
