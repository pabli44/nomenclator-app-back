import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { App } from 'supertest/types';
import { LikesController } from './likes.controller';
import { LikesService } from './likes.service';
import { ResponseInterceptor } from '../../common/interceptors/response.interceptor';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';

const TEST_SECRET = 'test-secret';

describe('LikesController (REQ-LK-1/2/3, REQ-GA-4)', () => {
  let app: INestApplication<App>;
  const likesService = {
    like: jest.fn(),
    unlike: jest.fn(),
    findLikedPostalIds: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [LikesController],
      providers: [
        { provide: LikesService, useValue: likesService },
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

  it('rejects PUT like without a token (401)', async () => {
    await request(app.getHttpServer()).put('/api/postals/p3/like').expect(401);

    expect(likesService.like).not.toHaveBeenCalled();
  });

  it('rejects PUT like with a malformed token (401)', async () => {
    await request(app.getHttpServer())
      .put('/api/postals/p3/like')
      .set('Authorization', 'Bearer not-a-jwt')
      .expect(401);
  });

  it('creates a like for the authenticated user and wraps {liked:true}', async () => {
    likesService.like.mockResolvedValue({ liked: true });

    const res = await request(app.getHttpServer())
      .put('/api/postals/p3/like')
      .set('Authorization', `Bearer ${validToken()}`)
      .expect(200);

    expect(res.body).toEqual({ statusCode: 200, data: { liked: true } });
    expect(likesService.like).toHaveBeenCalledWith('p3', 'user-1');
  });

  it('removes the like and wraps {liked:false}', async () => {
    likesService.unlike.mockResolvedValue({ liked: false });

    const res = await request(app.getHttpServer())
      .delete('/api/postals/p3/like')
      .set('Authorization', `Bearer ${validToken()}`)
      .expect(200);

    expect(res.body).toEqual({ statusCode: 200, data: { liked: false } });
    expect(likesService.unlike).toHaveBeenCalledWith('p3', 'user-1');
  });

  it('rejects GET /me/likes without a token (401)', async () => {
    await request(app.getHttpServer()).get('/api/me/likes').expect(401);
  });

  it('returns the liked postal ids for hydration', async () => {
    likesService.findLikedPostalIds.mockResolvedValue(['p3', 'p5']);

    const res = await request(app.getHttpServer())
      .get('/api/me/likes')
      .set('Authorization', `Bearer ${validToken()}`)
      .expect(200);

    expect(res.body).toEqual({ statusCode: 200, data: ['p3', 'p5'] });
    expect(likesService.findLikedPostalIds).toHaveBeenCalledWith('user-1');
  });
});
