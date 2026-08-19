import { DataSource } from 'typeorm';
export declare class AppService {
    private dataSource;
    constructor(dataSource: DataSource);
    getHello(): string;
    checkHealth(): Promise<{
        status: string;
        database: string;
        timestamp: string;
    }>;
}
