import { NotFoundException } from '@nestjs/common';
import { LikesService } from './likes.service';
import { Like } from './entities/like.entity';

describe('LikesService', () => {
  const buildService = () => {
    const likesRepository = {
      createQueryBuilder: jest.fn(),
      delete: jest.fn(),
      find: jest.fn(),
    };
    const postalsService = {
      exists: jest.fn(),
    };
    const service = new LikesService(
      likesRepository as never,
      postalsService as never,
    );
    return { service, likesRepository, postalsService };
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

  describe('like (REQ-LK-1)', () => {
    it('inserts a like with ON CONFLICT DO NOTHING and returns liked:true', async () => {
      const { service, likesRepository, postalsService } = buildService();
      postalsService.exists.mockResolvedValue(true);
      const { queryBuilder, execute } = buildIdempotentInsert(1);
      likesRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.like('p3', 'user-1');

      expect(postalsService.exists).toHaveBeenCalledWith('p3');
      expect(likesRepository.createQueryBuilder).toHaveBeenCalled();
      expect(queryBuilder.insert).toHaveBeenCalled();
      expect(queryBuilder.values).toHaveBeenCalledWith({
        userId: 'user-1',
        postalId: 'p3',
      });
      // Idempotency comes from the database, not from error handling.
      expect(queryBuilder.orIgnore).toHaveBeenCalled();
      expect(execute).toHaveBeenCalled();
      expect(result).toEqual({ liked: true });
    });

    it('returns liked:true also when the like already exists (no-op)', async () => {
      const { service, likesRepository, postalsService } = buildService();
      postalsService.exists.mockResolvedValue(true);
      const { queryBuilder, execute } = buildIdempotentInsert(0);
      likesRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.like('p3', 'user-1');

      expect(execute).toHaveBeenCalled();
      expect(result).toEqual({ liked: true });
    });

    it('throws 404 when the postal does not exist', async () => {
      const { service, postalsService } = buildService();
      postalsService.exists.mockResolvedValue(false);

      await expect(service.like('p99', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('unlike (REQ-LK-2)', () => {
    it('deletes the like row and returns liked:false', async () => {
      const { service, likesRepository, postalsService } = buildService();
      postalsService.exists.mockResolvedValue(true);
      likesRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.unlike('p3', 'user-1');

      expect(postalsService.exists).toHaveBeenCalledWith('p3');
      expect(likesRepository.delete).toHaveBeenCalledWith({
        userId: 'user-1',
        postalId: 'p3',
      });
      expect(result).toEqual({ liked: false });
    });

    it('returns liked:false when there was no like row (idempotent no-op)', async () => {
      const { service, likesRepository, postalsService } = buildService();
      postalsService.exists.mockResolvedValue(true);
      likesRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.unlike('p3', 'user-1')).resolves.toEqual({
        liked: false,
      });
    });

    it('throws 404 when the postal does not exist', async () => {
      const { service, postalsService } = buildService();
      postalsService.exists.mockResolvedValue(false);

      await expect(service.unlike('p99', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findLikedPostalIds (REQ-LK-3)', () => {
    it('returns the postal ids liked by the user', async () => {
      const { service, likesRepository } = buildService();
      likesRepository.find.mockResolvedValue([
        { id: 'l1', userId: 'user-1', postalId: 'p3' },
        { id: 'l2', userId: 'user-1', postalId: 'p5' },
      ] as Like[]);

      const result = await service.findLikedPostalIds('user-1');

      expect(likesRepository.find).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      });
      expect(result).toEqual(['p3', 'p5']);
    });

    it('returns an empty array when the user liked nothing', async () => {
      const { service, likesRepository } = buildService();
      likesRepository.find.mockResolvedValue([]);

      await expect(service.findLikedPostalIds('user-1')).resolves.toEqual([]);
    });
  });
});
