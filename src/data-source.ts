import 'dotenv/config';
import { DataSource } from 'typeorm';
import { buildMigrationDataSourceOptions } from './config/migration.config';

/**
 * TypeORM CLI data source (npm run migration:*). Run against Neon's DIRECT
 * (non-pooler) endpoint; the pooled endpoint breaks DDL.
 *
 * Single default export: the TypeORM CLI rejects files exposing more than one
 * DataSource instance.
 */
const AppDataSource = new DataSource(buildMigrationDataSourceOptions(process.env));

export default AppDataSource;