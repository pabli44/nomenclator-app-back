import { QueryFailedError } from 'typeorm';
import { AuthService, isUniqueViolation } from './auth.service';
import { User } from './entities/user.entity';

const DEVICE_UUID = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
const GUEST_EMAIL = `guest-${DEVICE_UUID}@device.local`;

describe('AuthService.registerGuest', () => {
  const buildService = () => {
    const usersRepository = {
      findOne: jest.fn(),
      create: jest.fn((data: User) => data),
      save: jest.fn(),
    };
    const jwtService = {
      sign: jest.fn(
        (payload: { sub: string; email: string }) => `token-for-${payload.sub}`,
      ),
    };
    const service = new AuthService(
      usersRepository as never,
      jwtService as never,
      {} as never,
    );
    return { service, usersRepository, jwtService };
  };

  const uniqueViolation = () =>
    new QueryFailedError(
      'INSERT INTO users ...',
      [],
      Object.assign(
        new Error(
          'duplicate key value violates unique constraint "users_email_key"',
        ),
        {
          code: '23505',
        },
      ),
    );

  it('creates a guest user on first launch and returns a wrapped JWT', async () => {
    const { service, usersRepository, jwtService } = buildService();
    usersRepository.findOne.mockResolvedValue(null);
    const savedUser = {
      id: 'user-1',
      email: GUEST_EMAIL,
      password: 'hashed',
    } as User;
    usersRepository.create.mockReturnValue(savedUser);
    usersRepository.save.mockResolvedValue(savedUser);

    const result = await service.registerGuest(DEVICE_UUID);

    expect(usersRepository.findOne).toHaveBeenCalledWith({
      where: { email: GUEST_EMAIL },
    });
    expect(usersRepository.create).toHaveBeenCalledTimes(1);
    const created = usersRepository.create.mock.calls[0][0];
    expect(created.email).toBe(GUEST_EMAIL);
    // The guest password is random but stored hashed, never plaintext.
    expect(created.password).toMatch(/^\$2[aby]\$10\$/);
    expect(jwtService.sign).toHaveBeenCalledWith({
      sub: 'user-1',
      email: GUEST_EMAIL,
    });
    expect(result).toEqual({
      access_token: 'token-for-user-1',
      user: { id: 'user-1', email: GUEST_EMAIL },
    });
  });

  it('reuses the existing user when the same device re-registers', async () => {
    const { service, usersRepository } = buildService();
    usersRepository.findOne.mockResolvedValue({
      id: 'user-1',
      email: GUEST_EMAIL,
      password: 'hashed',
    });

    const result = await service.registerGuest(DEVICE_UUID);

    expect(usersRepository.create).not.toHaveBeenCalled();
    expect(usersRepository.save).not.toHaveBeenCalled();
    expect(result).toEqual({
      access_token: 'token-for-user-1',
      user: { id: 'user-1', email: GUEST_EMAIL },
    });
  });

  it('recovers from a unique-violation race by re-fetching the winner', async () => {
    const { service, usersRepository } = buildService();
    usersRepository.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce({
      id: 'user-1',
      email: GUEST_EMAIL,
      password: 'hashed',
    });
    usersRepository.save.mockRejectedValue(uniqueViolation());

    const result = await service.registerGuest(DEVICE_UUID);

    expect(usersRepository.create).toHaveBeenCalledTimes(1);
    expect(usersRepository.findOne).toHaveBeenCalledTimes(2);
    expect(result).toEqual({
      access_token: 'token-for-user-1',
      user: { id: 'user-1', email: GUEST_EMAIL },
    });
  });

  it('rethrows the original error when the race has no winner', async () => {
    const { service, usersRepository } = buildService();
    usersRepository.findOne.mockResolvedValue(null);
    usersRepository.save.mockRejectedValue(uniqueViolation());

    await expect(service.registerGuest(DEVICE_UUID)).rejects.toThrow(
      'duplicate key value violates unique constraint',
    );
    expect(usersRepository.create).toHaveBeenCalledTimes(1);
  });

  it('does not swallow unrelated database errors', async () => {
    const { service, usersRepository } = buildService();
    usersRepository.findOne.mockResolvedValue(null);
    usersRepository.save.mockRejectedValue(new Error('connection refused'));

    await expect(service.registerGuest(DEVICE_UUID)).rejects.toThrow(
      'connection refused',
    );
  });
});

describe('isUniqueViolation', () => {
  const driverError = (code: string) =>
    Object.assign(new Error('db error'), { code });

  it('detects the postgres unique-violation code 23505', () => {
    expect(
      isUniqueViolation(
        new QueryFailedError('INSERT', [], driverError('23505')),
      ),
    ).toBe(true);
  });

  it('returns false for other driver error codes', () => {
    expect(
      isUniqueViolation(
        new QueryFailedError('INSERT', [], driverError('23503')),
      ),
    ).toBe(false);
  });

  it('returns false for non-error values', () => {
    expect(isUniqueViolation(null)).toBe(false);
    expect(isUniqueViolation(undefined)).toBe(false);
    expect(isUniqueViolation('boom')).toBe(false);
  });
});
