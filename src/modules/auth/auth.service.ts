import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import { User } from './entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';

/** Postgres unique-violation driver code. */
export function isUniqueViolation(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) return false;
  const driverError = (error as { driverError?: { code?: string } })
    .driverError;
  return driverError?.code === '23505';
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password } = registerDto;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.usersRepository.create({
      email,
      password: hashedPassword,
    });
    return this.usersRepository.save(user);
  }

  /**
   * Guest registration (REQ-GA-1): find-or-create a user keyed by the device
   * UUID email, then return a fresh JWT. Concurrent registrations with the
   * same UUID race on the unique email; the loser re-fetches the winner and
   * issues a fresh token instead of failing.
   */
  async registerGuest(deviceId: string) {
    const email = `guest-${deviceId}@device.local`;

    try {
      let user = await this.usersRepository.findOne({ where: { email } });
      if (!user) {
        const password = randomBytes(24).toString('hex');
        const hashedPassword = await bcrypt.hash(password, 10);
        user = this.usersRepository.create({ email, password: hashedPassword });
        user = await this.usersRepository.save(user);
      }
      return this.buildAuthResponse(user);
    } catch (error) {
      if (isUniqueViolation(error)) {
        const existing = await this.usersRepository.findOne({
          where: { email },
        });
        if (existing) return this.buildAuthResponse(existing);
      }
      throw error;
    }
  }

  private buildAuthResponse(user: User) {
    const payload = { sub: user.id, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
      user: { id: user.id, email: user.email },
    };
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) return null;

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return null;

    return user;
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.buildAuthResponse(user);
  }
}
