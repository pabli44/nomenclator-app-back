import { User } from '../modules/auth/entities/user.entity';
import {
  buildMigrationDataSourceOptions,
  resolveMigrationDatabaseUrl,
} from './migration.config';

describe('migration database url resolution', () => {
  it('prefers DIRECT_DATABASE_URL (non-pooler) over the pooled URL', () => {
    const url = resolveMigrationDatabaseUrl({
      DIRECT_DATABASE_URL: 'postgres://u:p@direct.neon.tech/db',
      DATABASE_URL: 'postgres://u:p@pooler.neon.tech/db',
    });
    expect(url).toBe('postgres://u:p@direct.neon.tech/db');
  });

  it('accepts DATABASE_URL_DIRECT as an alias', () => {
    const url = resolveMigrationDatabaseUrl({
      DATABASE_URL_DIRECT: 'postgres://u:p@direct.neon.tech/db',
    });
    expect(url).toBe('postgres://u:p@direct.neon.tech/db');
  });

  it('falls back to DATABASE_URL when no direct URL is provided', () => {
    const url = resolveMigrationDatabaseUrl({
      DATABASE_URL: 'postgres://u:p@pooler.neon.tech/db',
    });
    expect(url).toBe('postgres://u:p@pooler.neon.tech/db');
  });

  it('returns undefined when no database url exists', () => {
    expect(resolveMigrationDatabaseUrl({})).toBeUndefined();
  });
});

describe('migration data source options', () => {
  it('builds a postgres DataSource against the direct URL with migrations', () => {
    const options = buildMigrationDataSourceOptions({
      DIRECT_DATABASE_URL: 'postgres://u:p@direct.neon.tech/db',
      DATABASE_URL: 'postgres://u:p@pooler.neon.tech/db',
    });

    expect(options.type).toBe('postgres');
    if (options.type !== 'postgres') throw new Error('expected postgres');

    expect(options.url).toBe('postgres://u:p@direct.neon.tech/db');
    expect(options.ssl).toBe(true);
    expect(options.extra).toEqual({ max: 1, connectionTimeoutMillis: 10000 });
    expect(options.entities).toContain(User);
    expect(options.migrations).toEqual([
      expect.stringMatching(/migrations\/\*\{\.ts,\.js\}$/),
    ]);
  });

  it('disables SSL for localhost and keeps it enabled for remote hosts', () => {
    const local = buildMigrationDataSourceOptions({
      DIRECT_DATABASE_URL:
        'postgres://postgres:postgres@localhost:5433/nomenclator_db',
    });
    const localIp = buildMigrationDataSourceOptions({
      DIRECT_DATABASE_URL: 'postgres://postgres:postgres@127.0.0.1:5433/db',
    });
    const remote = buildMigrationDataSourceOptions({
      DIRECT_DATABASE_URL: 'postgres://u:p@direct.neon.tech/db',
    });

    expect(local.ssl).toBe(false);
    expect(localIp.ssl).toBe(false);
    expect(remote.ssl).toBe(true);
  });

  it('throws when no database url is configured', () => {
    expect(() => buildMigrationDataSourceOptions({})).toThrow(
      /DIRECT_DATABASE_URL|DATABASE_URL/,
    );
  });
});
