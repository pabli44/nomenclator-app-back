import databaseConfig from './database.config';

describe('database config', () => {
  const ENV_KEYS = [
    'DATABASE_URL',
    'DB_HOST',
    'DB_PORT',
    'DB_USERNAME',
    'DB_PASSWORD',
    'DB_NAME',
    'NODE_ENV',
  ] as const;
  const savedEnv: Record<string, string | undefined> = {};

  beforeAll(() => {
    for (const key of ENV_KEYS) {
      savedEnv[key] = process.env[key];
    }
  });

  afterEach(() => {
    for (const key of ENV_KEYS) {
      if (savedEnv[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = savedEnv[key];
      }
    }
  });

  describe('url mode (Neon pooled DATABASE_URL)', () => {
    it('connects via the pooled URL with ssl and a small pool', () => {
      process.env.DATABASE_URL =
        'postgres://user:pass@host-pooler.neon.tech/db?sslmode=require';
      delete process.env.DB_HOST;

      const options = databaseConfig();
      expect(options.type).toBe('postgres');
      if (options.type !== 'postgres') throw new Error('expected postgres');

      expect(options).toMatchObject({
        type: 'postgres',
        url: 'postgres://user:pass@host-pooler.neon.tech/db?sslmode=require',
        ssl: true,
        autoLoadEntities: true,
      });
      expect(options.extra).toEqual({
        max: 5,
        connectionTimeoutMillis: 10000,
      });
    });

    it('does not synchronize schema in production even with a URL', () => {
      process.env.DATABASE_URL = 'postgres://user:pass@pooler.neon.tech/db';
      process.env.NODE_ENV = 'production';

      expect(databaseConfig().synchronize).toBe(false);
    });

    it('synchronizes outside production for local url-mode dev', () => {
      process.env.DATABASE_URL = 'postgres://user:pass@pooler.neon.tech/db';
      process.env.NODE_ENV = 'development';

      expect(databaseConfig().synchronize).toBe(true);
    });
  });

  describe('host mode (local Postgres)', () => {
    it('keeps host/port/credentials mode when no DATABASE_URL is set', () => {
      delete process.env.DATABASE_URL;
      process.env.DB_HOST = 'localhost';
      process.env.DB_PORT = '5433';
      process.env.DB_USERNAME = 'postgres';
      process.env.DB_PASSWORD = 'postgres';
      process.env.DB_NAME = 'nomenclator_db';

      const options = databaseConfig();
      expect(options.type).toBe('postgres');
      if (options.type !== 'postgres') throw new Error('expected postgres');

      expect(options.url).toBeUndefined();
      expect(options).toMatchObject({
        type: 'postgres',
        host: 'localhost',
        port: 5433,
        username: 'postgres',
        password: 'postgres',
        database: 'nomenclator_db',
      });
    });

    it('applies sane defaults for host mode', () => {
      delete process.env.DATABASE_URL;
      delete process.env.DB_HOST;
      delete process.env.DB_PORT;
      delete process.env.DB_USERNAME;
      delete process.env.DB_PASSWORD;
      delete process.env.DB_NAME;

      const options = databaseConfig();
      expect(options.type).toBe('postgres');
      if (options.type !== 'postgres') throw new Error('expected postgres');

      expect(options.host).toBe('localhost');
      expect(options.port).toBe(5432);
      expect(options.username).toBe('postgres');
      expect(options.password).toBe('postgres');
      expect(options.database).toBe('nomenclator_db');
    });
  });
});
