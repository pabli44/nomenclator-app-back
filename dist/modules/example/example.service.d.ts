import { Repository } from 'typeorm';
import { Example } from './entities/example.entity';
import { CreateExampleDto } from './dto/create-example.dto';
import { UpdateExampleDto } from './dto/update-example.dto';
export declare class ExampleService {
    private examplesRepository;
    constructor(examplesRepository: Repository<Example>);
    findAll(): Promise<Example[]>;
    findOne(id: string): Promise<Example | null>;
    create(createExampleDto: CreateExampleDto): Promise<Example>;
    update(id: string, updateExampleDto: UpdateExampleDto): Promise<Example | null>;
    remove(id: string): Promise<{
        deleted: boolean;
    }>;
}
