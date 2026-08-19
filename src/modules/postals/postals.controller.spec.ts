import { Test } from '@nestjs/testing';
import { INestApplication, NotFoundException } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { PostalsController } from './postals.controller';
import { PostalsService } from './postals.service';
import { ResponseInterceptor } from '../../common/interceptors/response.interceptor';

describe('PostalsController (REQ-CA-1, REQ-CA-2)', () => {
  let app: INestApplication<App>;
  const postalsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [PostalsController],
      providers: [
        { provide: PostalsService, useValue: postalsService },
        ResponseInterceptor,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the catalog wrapped in the envelope (public)', async () => {
    postalsService.findAll.mockResolvedValue([
      { id: 'p3', name: 'Postal Colección Nomenclador', price: 25000 },
      { id: 'p5', name: 'Postal Calle del Arzobispado', price: 5000 },
    ]);

    const res = await request(app.getHttpServer())
      .get('/api/postals')
      .expect(200);

    expect(res.body).toEqual({
      statusCode: 200,
      data: [
        { id: 'p3', name: 'Postal Colección Nomenclador', price: 25000 },
        { id: 'p5', name: 'Postal Calle del Arzobispado', price: 5000 },
      ],
    });
    expect(postalsService.findAll).toHaveBeenCalled();
  });

  it('returns a single postal by id', async () => {
    postalsService.findOne.mockResolvedValue({
      id: 'p3',
      name: 'Postal Colección Nomenclador',
      price: 25000,
    });

    const res = await request(app.getHttpServer())
      .get('/api/postals/p3')
      .expect(200);

    expect(res.body).toEqual({
      statusCode: 200,
      data: { id: 'p3', name: 'Postal Colección Nomenclador', price: 25000 },
    });
    expect(postalsService.findOne).toHaveBeenCalledWith('p3');
  });

  it('returns 404 for an unknown postal id', async () => {
    postalsService.findOne.mockRejectedValue(new NotFoundException());

    await request(app.getHttpServer()).get('/api/postals/p99').expect(404);
  });
});
