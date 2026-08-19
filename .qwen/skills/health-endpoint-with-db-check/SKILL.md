---
name: health-endpoint-with-db-check
description: Make /health endpoints verify actual DB connectivity instead of returning hardcoded "ok", using TypeORM DataSource.isInitialized
source: auto-skill
extracted_at: '2026-05-29T04:55:10.596Z'
---

# Health Endpoint with Database Connectivity Check

## Problem
A `/health` endpoint that returns a hardcoded `"ok"` gives false confidence — the app may be running but the database could be down, and every data-dependent endpoint will fail silently or crash.

## Approach
Replace the dummy health check with one that verifies the database connection using TypeORM's `DataSource.isInitialized`.

### 1. Update AppService

```ts
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class AppService {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async checkHealth() {
    const dbUp = this.dataSource.isInitialized;
    return {
      status: dbUp ? 'ok' : 'error',
      database: dbUp ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
    };
  }
}
```

### 2. Update AppController

```ts
@Get('health')
@ApiOperation({ summary: 'Check application and database health' })
async health() {
  return this.appService.checkHealth();
}
```

### 3. Diagnosing DB connectivity issues

When `/health` returns `status: "error", database: "disconnected"`:

1. Verify the port is reachable: `nc -zv localhost <port>`
2. If the port is unreachable, start the database: `./scripts/db.sh start` (Podman) or `docker compose up -d` (Docker)
3. Verify `.env` `DB_PORT` matches the mapped port in `docker-compose.yml` (e.g., `5433:5432` means the host app should use `5433`)
4. For Podman newuidmap errors, see the `podman-rootless-db` skill

## Key insight
`DataSource.isInitialized` is lightweight — it checks the internal connection pool state without issuing a query. For a deeper check, you could also run `dataSource.query('SELECT 1')` inside a try/catch, but `isInitialized` is sufficient for most health checks and avoids overhead.