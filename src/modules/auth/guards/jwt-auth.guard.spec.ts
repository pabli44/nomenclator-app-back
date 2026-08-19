import { Test } from '@nestjs/testing';
import { Controller, Get, INestApplication, UseGuards } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { App } from 'supertest/types';
import { JwtStrategy } from '../strategies/jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';

const TEST_SECRET = 'test-secret';

@Controller('protected')
class ProtectedController {
  @Get()
  @UseGuards(JwtAuthGuard)
  get() {
    return { ok: true };
  }
}

describe('JwtAuthGuard (REQ-GA-4 mechanism)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ProtectedController],
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: { getOrThrow: () => TEST_SECRET },
        },
      ],
      imports: [PassportModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejects a request with no Authorization header (401)', async () => {
    await request(app.getHttpServer()).get('/protected').expect(401);
  });

  it('rejects a malformed token (401)', async () => {
    await request(app.getHttpServer())
      .get('/protected')
      .set('Authorization', 'Bearer not-a-jwt')
      .expect(401);
  });

  it('accepts a token signed with the configured secret', async () => {
    const jwt = new JwtService({
      secret: TEST_SECRET,
      signOptions: { expiresIn: '7d' } as never,
    });
    const token = jwt.sign({ sub: 'user-1', email: 'guest@device.local' });

    const res = await request(app.getHttpServer())
      .get('/protected')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toEqual({ ok: true });
  });
});
