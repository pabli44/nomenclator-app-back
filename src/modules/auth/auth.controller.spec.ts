import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ResponseInterceptor } from '../../common/interceptors/response.interceptor';

const DEVICE_UUID = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

describe('AuthController /auth/guest', () => {
  let app: INestApplication<App>;
  const authService = {
    registerGuest: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
        ResponseInterceptor,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('registers a guest and returns the wrapped envelope with status 200', async () => {
    authService.registerGuest.mockResolvedValue({
      access_token: 'jwt-token',
      user: { id: 'user-1', email: `guest-${DEVICE_UUID}@device.local` },
    });

    const res = await request(app.getHttpServer())
      .post('/auth/guest')
      .send({ deviceId: DEVICE_UUID })
      .expect(200);

    expect(res.body).toEqual({
      statusCode: 200,
      data: {
        access_token: 'jwt-token',
        user: { id: 'user-1', email: `guest-${DEVICE_UUID}@device.local` },
      },
    });
    expect(authService.registerGuest).toHaveBeenCalledWith(DEVICE_UUID);
  });

  it('rejects a malformed device id with 400 and does not call the service', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/guest')
      .send({ deviceId: 'not-a-uuid' })
      .expect(400);

    expect(authService.registerGuest).not.toHaveBeenCalled();
    expect((res.body as { message: unknown[] }).message).toEqual(
      expect.any(Array),
    );
  });

  it('rejects an unknown body property with 400 (whitelist)', async () => {
    await request(app.getHttpServer())
      .post('/auth/guest')
      .send({ deviceId: DEVICE_UUID, extra: 'nope' })
      .expect(400);

    expect(authService.registerGuest).not.toHaveBeenCalled();
  });
});
