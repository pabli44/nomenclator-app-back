import { validateSync } from 'class-validator';
import { GuestDto } from './dto/guest.dto';

describe('GuestDto', () => {
  it('accepts a valid UUID v4 device id', () => {
    const dto = new GuestDto();
    dto.deviceId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
    expect(validateSync(dto)).toHaveLength(0);
  });

  it('rejects a non-UUID device id', () => {
    const dto = new GuestDto();
    dto.deviceId = 'not-a-uuid';
    const errors = validateSync(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('deviceId');
  });

  it('rejects a UUID v1 (only v4 is accepted)', () => {
    const dto = new GuestDto();
    dto.deviceId = 'd9428888-122b-11e1-b85c-61cd3cbb3210';
    expect(validateSync(dto)).toHaveLength(1);
  });

  it('rejects a missing device id', () => {
    const dto = new GuestDto();
    expect(validateSync(dto)).toHaveLength(1);
  });
});
