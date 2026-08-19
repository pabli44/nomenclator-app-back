import { SavedItemsService } from './saved-items.service';
export declare class SavedItemsController {
    private readonly savedItemsService;
    constructor(savedItemsService: SavedItemsService);
    save(type: string, id: string, req: {
        user: {
            id: string;
        };
    }): Promise<{
        saved: boolean;
    }>;
    unsave(type: string, id: string, req: {
        user: {
            id: string;
        };
    }): Promise<{
        saved: boolean;
    }>;
    findMySaved(req: {
        user: {
            id: string;
        };
    }): Promise<{
        type: import("./entities/saved-item.entity").SavedItemType;
        id: string;
    }[]>;
}
