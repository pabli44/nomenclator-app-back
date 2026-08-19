import { Repository } from 'typeorm';
import { Postal } from './entities/postal.entity';
export declare class PostalsService {
    private readonly postalsRepository;
    constructor(postalsRepository: Repository<Postal>);
    findAll(): Promise<Postal[]>;
    findOne(id: string): Promise<Postal>;
    exists(id: string): Promise<boolean>;
}
