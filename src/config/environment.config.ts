/**
 * Vercel forces NODE_ENV=production on every deployment, including previews.
 * Environment discrimination must therefore go through VERCEL_ENV.
 */
export function isVercelProduction(vercelEnv: string | undefined): boolean {
  return vercelEnv === 'production';
}