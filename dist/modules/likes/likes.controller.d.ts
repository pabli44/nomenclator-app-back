import { LikesService } from './likes.service';
export declare class LikesController {
    private readonly likesService;
    constructor(likesService: LikesService);
    like(id: string, req: {
        user: {
            id: string;
        };
    }): Promise<{
        liked: boolean;
    }>;
    unlike(id: string, req: {
        user: {
            id: string;
        };
    }): Promise<{
        liked: boolean;
    }>;
    findLikedPostalIds(req: {
        user: {
            id: string;
        };
    }): Promise<string[]>;
}
