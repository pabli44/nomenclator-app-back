import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs(
  'database',
  (): TypeOrmModuleOptions => {
    const databaseUrl = process.env.DATABASE_URL;

    // Neon pooled URL mode (runtime): PgBouncer pools server-side, so keep the
    // client pool tiny and allow the first connection to absorb compute wake-up.
    if (databaseUrl) {
      return {
        type: 'postgres',
        url: databaseUrl,
        autoLoadEntities: true,
        ssl: true,
        extra: {
          max: 5,
          connectionTimeoutMillis: 10000,
        },
        synchronize: process.env.NODE_ENV !== 'production',
      };
    }

    // Local host-mode fallback (docker-compose Postgres).
    return {
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'nomenclator_db',
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV !== 'production',
    };
  },
);