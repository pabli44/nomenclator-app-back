import { join } from 'path';
import { DataSourceOptions } from 'typeorm';
import { User } from '../modules/auth/entities/user.entity';

/**
 * Migrations must run against the Neon DIRECT (non-pooler) endpoint: the
 * pooled endpoint goes through PgBouncer in transaction mode, which breaks DDL.
 */
export function resolveMigrationDatabaseUrl(
  env: NodeJS.ProcessEnv,
): string | undefined {
  return env.DIRECT_DATABASE_URL || env.DATABASE_URL_DIRECT || env.DATABASE_URL;
}

export function buildMigrationDataSourceOptions(
  env: NodeJS.ProcessEnv,
): DataSourceOptions {
  const url = resolveMigrationDatabaseUrl(env);
  if (!url) {
    throw new Error(
      'Missing database url for migrations: set DIRECT_DATABASE_URL (or DATABASE_URL)',
    );
  }

  // Local dev Postgres (localhost/127.0.0.1) has no TLS; remote hosts (Neon)
  // require it. Deriving from the host keeps local runs and production correct
  // without extra environment switches.
  const useSsl = !/localhost|127\.0\.0\.1/.test(url);

  return {
    type: 'postgres',
    url,
    ssl: useSsl,
    extra: {
      // Single connection: migrations are one-shot DDL runs.
      max: 1,
      connectionTimeoutMillis: 10000,
    },
    entities: [User],
    migrations: [join(__dirname, '..', 'migrations', '*{.ts,.js}')],
  };
}
