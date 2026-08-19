import { Repository } from 'typeorm';
import { Like } from './entities/like.entity';
import { PostalsService } from '../postals/postals.service';
export declare class LikesService {
    private readonly likesRepository;
    private readonly postalsService;
    constructor(likesRepository: Repository<Like>, postalsService: PostalsService);
    like(postalId: string, userId: string): Promise<{
        liked: boolean;
    }>;
    unlike(postalId: string, userId: string): Promise<{
        liked: boolean;
    }>;
    findLikedPostalIds(userId: string): Promise<string[]>;
    private assertPostalExists;
}
