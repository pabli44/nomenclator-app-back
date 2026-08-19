import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Like } from './entities/like.entity';
import { PostalsService } from '../postals/postals.service';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Like)
    private readonly likesRepository: Repository<Like>,
    private readonly postalsService: PostalsService,
  ) {}

  async like(postalId: string, userId: string) {
    await this.assertPostalExists(postalId);
    // Idempotent by design (D6): repeated PUTs are a successful no-op.
    await this.likesRepository
      .createQueryBuilder()
      .insert()
      .into(Like)
      .values({ userId, postalId })
      .orIgnore()
      .execute();
    return { liked: true };
  }

  async unlike(postalId: string, userId: string) {
    await this.assertPostalExists(postalId);
    // delete() is naturally idempotent: no row -> affected 0, no error.
    await this.likesRepository.delete({ userId, postalId });
    return { liked: false };
  }

  async findLikedPostalIds(userId: string): Promise<string[]> {
    const likes = await this.likesRepository.find({ where: { userId } });
    return likes.map((like) => like.postalId);
  }

  private async assertPostalExists(postalId: string): Promise<void> {
    const exists = await this.postalsService.exists(postalId);
    if (!exists) {
      throw new NotFoundException(`Postal with id "${postalId}" not found`);
    }
  }
}
