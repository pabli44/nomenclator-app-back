import { NotFoundException } from '@nestjs/common';
import { PostalsService } from './postals.service';
import { Postal } from './entities/postal.entity';

describe('PostalsService', () => {
  const buildService = () => {
    const postalsRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      exists: jest.fn(),
    };
    const service = new PostalsService(postalsRepository as never);
    return { service, postalsRepository };
  };

  const postalP3 = {
    id: 'p3',
    name: 'Postal Colección Nomenclador',
    description: 'Set de 10 postales',
    price: 25000,
    category: 'Postales',
    imageUrl: null,
  } as Postal;
  const postalP5 = {
    id: 'p5',
    name: 'Postal Calle del Arzobispado',
    description: 'Postal individual',
    price: 5000,
    category: 'Postales',
    imageUrl: null,
  } as Postal;

  describe('findAll', () => {
    it('returns every seeded postal row', async () => {
      const { service, postalsRepository } = buildService();
      postalsRepository.find.mockResolvedValue([postalP3, postalP5]);

      const result = await service.findAll();

      expect(postalsRepository.find).toHaveBeenCalledWith();
      expect(result).toEqual([postalP3, postalP5]);
    });

    it('returns an empty array when the table is empty', async () => {
      const { service, postalsRepository } = buildService();
      postalsRepository.find.mockResolvedValue([]);

      await expect(service.findAll()).resolves.toEqual([]);
    });
  });

  describe('findOne', () => {
    it('returns the postal matching the id', async () => {
      const { service, postalsRepository } = buildService();
      postalsRepository.findOne.mockResolvedValue(postalP3);

      const result = await service.findOne('p3');

      expect(postalsRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'p3' },
      });
      expect(result).toEqual(postalP3);
    });

    it('throws 404 when the postal does not exist', async () => {
      const { service, postalsRepository } = buildService();
      postalsRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('p99')).rejects.toThrow(NotFoundException);
    });
  });

  describe('exists', () => {
    it('returns true for an existing postal id', async () => {
      const { service, postalsRepository } = buildService();
      postalsRepository.exists.mockResolvedValue(true);

      await expect(service.exists('p3')).resolves.toBe(true);
      expect(postalsRepository.exists).toHaveBeenCalledWith({
        where: { id: 'p3' },
      });
    });

    it('returns false for an unknown postal id', async () => {
      const { service, postalsRepository } = buildService();
      postalsRepository.exists.mockResolvedValue(false);

      await expect(service.exists('p99')).resolves.toBe(false);
    });
  });
});
