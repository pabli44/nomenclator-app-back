import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SavedItem, SavedItemType } from './entities/saved-item.entity';
import { PostalsService } from '../postals/postals.service';

const VALID_ITEM_TYPES: readonly SavedItemType[] = ['street', 'postal'];

@Injectable()
export class SavedItemsService {
  constructor(
    @InjectRepository(SavedItem)
    private readonly savedItemsRepository: Repository<SavedItem>,
    private readonly postalsService: PostalsService,
  ) {}

  async save(type: string, itemId: string, userId: string) {
    const itemType = this.assertValidType(type);
    await this.assertItemExists(itemType, itemId);
    // Idempotent by design (D6): repeated PUTs are a successful no-op.
    await this.savedItemsRepository
      .createQueryBuilder()
      .insert()
      .into(SavedItem)
      .values({ userId, itemType, itemId })
      .orIgnore()
      .execute();
    return { saved: true };
  }

  async unsave(type: string, itemId: string, userId: string) {
    const itemType = this.assertValidType(type);
    await this.assertItemExists(itemType, itemId);
    // delete() is naturally idempotent: no row -> affected 0, no error.
    await this.savedItemsRepository.delete({ userId, itemType, itemId });
    return { saved: false };
  }

  async findMySaved(userId: string): Promise<{ type: SavedItemType; id: string }[]> {
    const items = await this.savedItemsRepository.find({ where: { userId } });
    return items.map((item) => ({ type: item.itemType, id: item.itemId }));
  }

  private assertValidType(type: string): SavedItemType {
    if (!VALID_ITEM_TYPES.includes(type as SavedItemType)) {
      throw new BadRequestException(
        `Invalid item_type "${type}": must be one of ${VALID_ITEM_TYPES.join(', ')}`,
      );
    }
    return type as SavedItemType;
  }

  private async assertItemExists(
    itemType: SavedItemType,
    itemId: string,
  ): Promise<void> {
    if (itemType !== 'postal') return;
    const exists = await this.postalsService.exists(itemId);
    if (!exists) {
      throw new NotFoundException(`Postal with id "${itemId}" not found`);
    }
  }
}