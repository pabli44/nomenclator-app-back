"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.envValidationSchema = void 0;
const Joi = __importStar(require("joi"));
const DATABASE_GROUP = [
    'DB_HOST',
    'DB_PORT',
    'DB_USERNAME',
    'DB_PASSWORD',
    'DB_NAME',
];
exports.envValidationSchema = Joi.object({
    PORT: Joi.number().default(3000),
    DATABASE_URL: Joi.string()
        .uri({ scheme: ['postgres', 'postgresql'] })
        .optional(),
    DIRECT_DATABASE_URL: Joi.string()
        .uri({ scheme: ['postgres', 'postgresql'] })
        .optional(),
    DATABASE_URL_DIRECT: Joi.string()
        .uri({ scheme: ['postgres', 'postgresql'] })
        .optional(),
    DB_HOST: Joi.string().optional(),
    DB_PORT: Joi.number().default(5432).optional(),
    DB_USERNAME: Joi.string().optional(),
    DB_PASSWORD: Joi.string().optional(),
    DB_NAME: Joi.string().optional(),
    NODE_ENV: Joi.string().optional(),
    VERCEL_ENV: Joi.string()
        .valid('production', 'preview', 'development')
        .optional(),
    JWT_SECRET: Joi.string().required(),
    JWT_EXPIRATION: Joi.string().default('7d'),
}).custom((value, helpers) => {
    const hasUrl = Boolean(value.DATABASE_URL);
    const hasDatabaseGroup = DATABASE_GROUP.every((key) => value[key] !== undefined && value[key] !== '');
    if (!hasUrl && !hasDatabaseGroup) {
        return helpers.error('any.custom', {
            message: 'Provide either DATABASE_URL (Neon pooled) or the DB_HOST/DB_PORT/DB_USERNAME/DB_PASSWORD/DB_NAME group',
        });
    }
    return value;
});
//# sourceMappingURL=env.validation.js.map