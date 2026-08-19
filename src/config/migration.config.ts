import { join } from 'path';
import { DataSourceOptions } from 'typeorm';
import { User } from '../modules/auth/entities/user.entity';

/**
 * Migrations must run against the Neon DIRECT (non-pooler) endpoint: the
 * pooled endpoint goes through PgBouncer in transaction mode, which breaks DDL.
 */
export function resolveMigrationDatabaseUrl(env: NodeJS.ProcessEnv): string | undefined {
  return env.DIRECT_DATABASE_URL || env.DATABASE_URL_DIRECT || env.DATABASE_URL;
}

export function buildMigrationDataSourceOptions(env: NodeJS.ProcessEnv): DataSourceOptions {
  const url = resolveMigrationDatabaseUrl(env);
  if (!url) {
    throw new Error(
      'Missing database url for migrations: set DIRECT_DATABASE_URL (or DATABASE_URL)',
    );
  }

  return {
    type: 'postgres',
    url,
    ssl: true,
    extra: {
      // Single connection: migrations are one-shot DDL runs.
      max: 1,
      connectionTimeoutMillis: 10000,
    },
    entities: [User],
    migrations: [join(__dirname, '..', 'migrations', '*{.ts,.js}')],
  };
}