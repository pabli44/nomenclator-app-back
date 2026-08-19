import { Repository } from 'typeorm';
import { SavedItem, SavedItemType } from './entities/saved-item.entity';
import { PostalsService } from '../postals/postals.service';
export declare class SavedItemsService {
    private readonly savedItemsRepository;
    private readonly postalsService;
    constructor(savedItemsRepository: Repository<SavedItem>, postalsService: PostalsService);
    save(type: string, itemId: string, userId: string): Promise<{
        saved: boolean;
    }>;
    unsave(type: string, itemId: string, userId: string): Promise<{
        saved: boolean;
    }>;
    findMySaved(userId: string): Promise<{
        type: SavedItemType;
        id: string;
    }[]>;
    private assertValidType;
    private assertItemExists;
}
