import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class AppService {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async checkHealth() {
    const dbUp = this.dataSource.isInitialized;
    return {
      status: dbUp ? 'ok' : 'error',
      database: dbUp ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
    };
  }
}
