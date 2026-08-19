import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SavedItemsService } from './saved-items.service';
import { SavedItem } from './entities/saved-item.entity';

describe('SavedItemsService', () => {
  const buildService = () => {
    const savedItemsRepository = {
      createQueryBuilder: jest.fn(),
      delete: jest.fn(),
      find: jest.fn(),
    };
    const postalsService = {
      exists: jest.fn(),
    };
    const service = new SavedItemsService(
      savedItemsRepository as never,
      postalsService as never,
    );
    return { service, savedItemsRepository, postalsService };
  };

  const buildIdempotentInsert = (affected: number) => {
    const execute = jest.fn().mockResolvedValue({ affected });
    const queryBuilder = {
      insert: jest.fn().mockReturnThis(),
      into: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      orIgnore: jest.fn().mockReturnThis(),
      execute,
    };
    return { queryBuilder, execute };
  };

  describe('save (REQ-SV-1)', () => {
    it('inserts a postal saved item with ON CONFLICT DO NOTHING and returns saved:true', async () => {
      const { service, savedItemsRepository, postalsService } = buildService();
      postalsService.exists.mockResolvedValue(true);
      const { queryBuilder, execute } = buildIdempotentInsert(1);
      savedItemsRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.save('postal', 'p3', 'user-1');

      expect(postalsService.exists).toHaveBeenCalledWith('p3');
      expect(savedItemsRepository.createQueryBuilder).toHaveBeenCalled();
      expect(queryBuilder.values).toHaveBeenCalledWith({
        userId: 'user-1',
        itemType: 'postal',
        itemId: 'p3',
      });
      // Idempotency comes from the database, not from error handling.
      expect(queryBuilder.orIgnore).toHaveBeenCalled();
      expect(execute).toHaveBeenCalled();
      expect(result).toEqual({ saved: true });
    });

    it('stores a street id as-is without any postal FK check', async () => {
      const { service, savedItemsRepository, postalsService } = buildService();
      const { queryBuilder, execute } = buildIdempotentInsert(1);
      savedItemsRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.save('street', 'avenida-1', 'user-1');

      expect(postalsService.exists).not.toHaveBeenCalled();
      expect(queryBuilder.values).toHaveBeenCalledWith({
        userId: 'user-1',
        itemType: 'street',
        itemId: 'avenida-1',
      });
      expect(execute).toHaveBeenCalled();
      expect(result).toEqual({ saved: true });
    });

    it('returns saved:true also when the item is already saved (no-op)', async () => {
      const { service, savedItemsRepository, postalsService } = buildService();
      postalsService.exists.mockResolvedValue(true);
      const { queryBuilder, execute } = buildIdempotentInsert(0);
      savedItemsRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.save('postal', 'p3', 'user-1');

      expect(execute).toHaveBeenCalled();
      expect(result).toEqual({ saved: true });
    });

    it('throws 400 for an invalid item type', async () => {
      const { service, savedItemsRepository, postalsService } = buildService();

      await expect(service.save('photo', 'x', 'user-1')).rejects.toThrow(
        BadRequestException,
      );
      expect(savedItemsRepository.createQueryBuilder).not.toHaveBeenCalled();
      expect(postalsService.exists).not.toHaveBeenCalled();
    });

    it('throws 404 when the postal does not exist', async () => {
      const { service, savedItemsRepository, postalsService } = buildService();
      postalsService.exists.mockResolvedValue(false);

      await expect(service.save('postal', 'p99', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
      expect(savedItemsRepository.createQueryBuilder).not.toHaveBeenCalled();
    });
  });

  describe('unsave (REQ-SV-2)', () => {
    it('deletes the saved row and returns saved:false', async () => {
      const { service, savedItemsRepository, postalsService } = buildService();
      postalsService.exists.mockResolvedValue(true);
      savedItemsRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.unsave('postal', 'p3', 'user-1');

      expect(postalsService.exists).toHaveBeenCalledWith('p3');
      expect(savedItemsRepository.delete).toHaveBeenCalledWith({
        userId: 'user-1',
        itemType: 'postal',
        itemId: 'p3',
      });
      expect(result).toEqual({ saved: false });
    });

    it('returns saved:false when there was no saved row (idempotent no-op)', async () => {
      const { service, savedItemsRepository, postalsService } = buildService();
      postalsService.exists.mockResolvedValue(true);
      savedItemsRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.unsave('postal', 'p3', 'user-1')).resolves.toEqual({
        saved: false,
      });
    });

    it('throws 400 for an invalid item type without touching the repository', async () => {
      const { service, savedItemsRepository, postalsService } = buildService();

      await expect(service.unsave('photo', 'x', 'user-1')).rejects.toThrow(
        BadRequestException,
      );
      expect(savedItemsRepository.delete).not.toHaveBeenCalled();
      expect(postalsService.exists).not.toHaveBeenCalled();
    });

    it('throws 404 when the postal does not exist', async () => {
      const { service, savedItemsRepository, postalsService } = buildService();
      postalsService.exists.mockResolvedValue(false);

      await expect(service.unsave('postal', 'p99', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
      expect(savedItemsRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('findMySaved (REQ-SV-3)', () => {
    it('returns the saved items with type and id for hydration', async () => {
      const { service, savedItemsRepository } = buildService();
      savedItemsRepository.find.mockResolvedValue([
        { id: 's1', userId: 'user-1', itemType: 'postal', itemId: 'p3' },
        { id: 's2', userId: 'user-1', itemType: 'street', itemId: 'avenida-1' },
      ] as SavedItem[]);

      const result = await service.findMySaved('user-1');

      expect(savedItemsRepository.find).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      });
      expect(result).toEqual([
        { type: 'postal', id: 'p3' },
        { type: 'street', id: 'avenida-1' },
      ]);
    });

    it('returns an empty array when the user saved nothing', async () => {
      const { service, savedItemsRepository } = buildService();
      savedItemsRepository.find.mockResolvedValue([]);

      await expect(service.findMySaved('user-1')).resolves.toEqual([]);
    });
  });
});