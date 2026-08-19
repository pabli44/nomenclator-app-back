import { DataSourceOptions } from 'typeorm';
export declare function resolveMigrationDatabaseUrl(env: NodeJS.ProcessEnv): string | undefined;
export declare function buildMigrationDataSourceOptions(env: NodeJS.ProcessEnv): DataSourceOptions;
