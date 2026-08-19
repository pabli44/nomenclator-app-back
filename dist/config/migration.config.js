"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveMigrationDatabaseUrl = resolveMigrationDatabaseUrl;
exports.buildMigrationDataSourceOptions = buildMigrationDataSourceOptions;
const path_1 = require("path");
const user_entity_1 = require("../modules/auth/entities/user.entity");
function resolveMigrationDatabaseUrl(env) {
    return env.DIRECT_DATABASE_URL || env.DATABASE_URL_DIRECT || env.DATABASE_URL;
}
function buildMigrationDataSourceOptions(env) {
    const url = resolveMigrationDatabaseUrl(env);
    if (!url) {
        throw new Error('Missing database url for migrations: set DIRECT_DATABASE_URL (or DATABASE_URL)');
    }
    return {
        type: 'postgres',
        url,
        ssl: true,
        extra: {
            max: 1,
            connectionTimeoutMillis: 10000,
        },
        entities: [user_entity_1.User],
        migrations: [(0, path_1.join)(__dirname, '..', 'migrations', '*{.ts,.js}')],
    };
}
//# sourceMappingURL=migration.config.js.map