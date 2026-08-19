import { PostalsService } from './postals.service';
export declare class PostalsController {
    private readonly postalsService;
    constructor(postalsService: PostalsService);
    findAll(): Promise<import("./entities/postal.entity").Postal[]>;
    findOne(id: string): Promise<import("./entities/postal.entity").Postal>;
}
