/**
 * Global runtime mode flags (no secrets).
 * MOCK_MODE=true → billing simulation (no real API keys required).
 */
export function isMockMode() {
  const v = String(process.env.MOCK_MODE || '').toLowerCase();
  return v === '1' || v === 'true' || v === 'yes';
}

export function appEnvironment() {
  return (
    process.env.APP_ENV ||
    process.env.NODE_ENV ||
    'development'
  );
}

export function isProductionNodeEnv() {
  return process.env.NODE_ENV === 'production';
}
