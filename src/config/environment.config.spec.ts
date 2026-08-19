import { isVercelProduction } from './environment.config';

describe('environment config', () => {
  it('treats only VERCEL_ENV=production as production', () => {
    expect(isVercelProduction('production')).toBe(true);
  });

  it('treats preview as non-production (NODE_ENV is always production on previews)', () => {
    expect(isVercelProduction('preview')).toBe(false);
  });

  it('treats development and unset as non-production', () => {
    expect(isVercelProduction('development')).toBe(false);
    expect(isVercelProduction(undefined)).toBe(false);
  });
});