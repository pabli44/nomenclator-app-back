"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const typeorm_1 = require("typeorm");
const migration_config_1 = require("./config/migration.config");
const AppDataSource = new typeorm_1.DataSource((0, migration_config_1.buildMigrationDataSourceOptions)(process.env));
exports.default = AppDataSource;
//# sourceMappingURL=data-source.js.map