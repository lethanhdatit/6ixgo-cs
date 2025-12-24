// Environment configuration - Auto-detect based on runtime

interface EnvironmentConfig {
  resourceApiUrl: string;
  adminApiUrl: string;
  identityApiUrl: string;
  originUrl: string;
  isProduction: boolean;
}

// Production domains
const PRODUCTION_DOMAINS = [
  'admin.6ixgo.com',
  '6ixgo.com',
  'https://lethanhdatit.github.io/6ixgo-cs'
];

// Check if current environment is production
export const isProduction = (): boolean => {
  if (typeof window === 'undefined') {
    // Server-side: check NODE_ENV
    return process.env.NODE_ENV === 'production';
  }
  
  // Client-side: check hostname
  const hostname = window.location.hostname;
  
  // Production if on production domain
  return PRODUCTION_DOMAINS.some(domain => hostname.includes(domain));
};

// Staging config (used for localhost, GitHub Pages, staging domain, etc.)
const stagingConfig: EnvironmentConfig = {
  resourceApiUrl: 'https://staging-api.6ixgo.com/api/v1',
  adminApiUrl: 'https://staging-admin-api.6ixgo.com/api/v1',
  identityApiUrl: 'https://staging-identity.6ixgo.com/id/v1',
  originUrl: 'https://staging-admin.6ixgo.com',
  isProduction: false,
};

// Production config
const productionConfig: EnvironmentConfig = {
  resourceApiUrl: 'https://b2c.api.6ixgo.com/api/v1',
  adminApiUrl: 'https://admin-api.6ixgo.com/api/v1',
  identityApiUrl: 'https://identity.6ixgo.com/id/v1',
  originUrl: 'https://admin.6ixgo.com',
  isProduction: true,
};

export const getConfig = (): EnvironmentConfig => {
  return isProduction() ? productionConfig : stagingConfig;
};

export const getTimezoneOffset = (): number => {
  return new Date().getTimezoneOffset();
};

// For display purposes
export const getEnvironmentName = (): string => {
  return isProduction() ? 'Production' : 'Staging';
};

export default { getConfig, isProduction, getEnvironmentName };
