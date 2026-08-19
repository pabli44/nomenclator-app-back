import { Test } from '@nestjs/testing';
import { INestApplication, BadRequestException } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { App } from 'supertest/types';
import { SavedItemsController } from './saved-items.controller';
import { SavedItemsService } from './saved-items.service';
import { ResponseInterceptor } from '../../common/interceptors/response.interceptor';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';

const TEST_SECRET = 'test-secret';

describe('SavedItemsController (REQ-SV-1/2/3, REQ-GA-4)', () => {
  let app: INestApplication<App>;
  const savedItemsService = {
    save: jest.fn(),
    unsave: jest.fn(),
    findMySaved: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [SavedItemsController],
      providers: [
        { provide: SavedItemsService, useValue: savedItemsService },
        ResponseInterceptor,
        JwtStrategy,
        { provide: ConfigService, useValue: { getOrThrow: () => TEST_SECRET } },
      ],
      imports: [PassportModule],
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

  const validToken = () => {
    const jwt = new JwtService({
      secret: TEST_SECRET,
      signOptions: { expiresIn: '7d' } as never,
    });
    return jwt.sign({ sub: 'user-1', email: 'guest@device.local' });
  };

  it('rejects PUT save without a token (401)', async () => {
    await request(app.getHttpServer())
      .put('/api/items/postal/p3/save')
      .expect(401);

    expect(savedItemsService.save).not.toHaveBeenCalled();
  });

  it('rejects PUT save with a malformed token (401)', async () => {
    await request(app.getHttpServer())
      .put('/api/items/postal/p3/save')
      .set('Authorization', 'Bearer not-a-jwt')
      .expect(401);
  });

  it('saves an item for the authenticated user and wraps {saved:true}', async () => {
    savedItemsService.save.mockResolvedValue({ saved: true });

    const res = await request(app.getHttpServer())
      .put('/api/items/postal/p3/save')
      .set('Authorization', `Bearer ${validToken()}`)
      .expect(200);

    expect(res.body).toEqual({ statusCode: 200, data: { saved: true } });
    expect(savedItemsService.save).toHaveBeenCalledWith('postal', 'p3', 'user-1');
  });

  it('returns 400 for an invalid item type', async () => {
    savedItemsService.save.mockRejectedValue(
      new BadRequestException('Invalid item_type "photo"'),
    );

    await request(app.getHttpServer())
      .put('/api/items/photo/x/save')
      .set('Authorization', `Bearer ${validToken()}`)
      .expect(400);
  });

  it('unsaves an item and wraps {saved:false}', async () => {
    savedItemsService.unsave.mockResolvedValue({ saved: false });

    const res = await request(app.getHttpServer())
      .delete('/api/items/street/avenida-1/save')
      .set('Authorization', `Bearer ${validToken()}`)
      .expect(200);

    expect(res.body).toEqual({ statusCode: 200, data: { saved: false } });
    expect(savedItemsService.unsave).toHaveBeenCalledWith(
      'street',
      'avenida-1',
      'user-1',
    );
  });

  it('returns 400 for an invalid item type on DELETE', async () => {
    savedItemsService.unsave.mockRejectedValue(
      new BadRequestException('Invalid item_type "photo"'),
    );

    await request(app.getHttpServer())
      .delete('/api/items/photo/x/save')
      .set('Authorization', `Bearer ${validToken()}`)
      .expect(400);
  });

  it('rejects GET /me/saved without a token (401)', async () => {
    await request(app.getHttpServer()).get('/api/me/saved').expect(401);
  });

  it('returns the saved items for hydration', async () => {
    savedItemsService.findMySaved.mockResolvedValue([
      { type: 'postal', id: 'p3' },
      { type: 'street', id: 'avenida-1' },
    ]);

    const res = await request(app.getHttpServer())
      .get('/api/me/saved')
      .set('Authorization', `Bearer ${validToken()}`)
      .expect(200);

    expect(res.body).toEqual({
      statusCode: 200,
      data: [
        { type: 'postal', id: 'p3' },
        { type: 'street', id: 'avenida-1' },
      ],
    });
    expect(savedItemsService.findMySaved).toHaveBeenCalledWith('user-1');
  });
});