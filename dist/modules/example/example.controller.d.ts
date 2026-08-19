import { ExampleService } from './example.service';
import { CreateExampleDto } from './dto/create-example.dto';
import { UpdateExampleDto } from './dto/update-example.dto';
export declare class ExampleController {
    private readonly exampleService;
    constructor(exampleService: ExampleService);
    findAll(): Promise<import("./entities/example.entity").Example[]>;
    findOne(id: string): Promise<import("./entities/example.entity").Example | null>;
    create(createExampleDto: CreateExampleDto): Promise<import("./entities/example.entity").Example>;
    update(id: string, updateExampleDto: UpdateExampleDto): Promise<import("./entities/example.entity").Example | null>;
    remove(id: string): Promise<{
        deleted: boolean;
    }>;
}
