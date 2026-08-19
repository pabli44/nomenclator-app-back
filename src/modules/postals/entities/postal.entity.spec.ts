import { toNumber } from './postal.entity';

describe('Postal numeric price transformer (D5)', () => {
  it('converts the pg numeric string to a JS number', () => {
    expect(toNumber('25000.00')).toBe(25000);
  });

  it('preserves fractional precision', () => {
    expect(toNumber('0.50')).toBe(0.5);
    expect(toNumber('18.75')).toBe(18.75);
  });

  it('keeps null and undefined values untouched', () => {
    expect(toNumber(null)).toBeNull();
    expect(toNumber(undefined)).toBeUndefined();
  });
});
