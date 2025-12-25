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
  'lethanhdatit.github.io'  // GitHub Pages
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
  return PRODUCTION_DOMAINS.some(domain => hostname.includes(domain) || domain.includes(hostname));
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

/**
 * Get the base path for routing.
 * On GitHub Pages (production build), Next.js sets basePath to '/6ixgo-cs'
 * which is automatically prepended to all routes by Next.js router.
 * We don't need to manually add basePath when using router.push() or Link.
 * 
 * However, when checking pathname from usePathname(), the basePath IS included.
 * So we need this utility to normalize path comparisons.
 */
export const getBasePath = (): string => {
  // Check if we're on GitHub Pages by looking at the pathname
  if (typeof window !== 'undefined') {
    // On GitHub Pages, the basePath will be in the URL
    if (window.location.pathname.startsWith('/6ixgo-cs')) {
      return '/6ixgo-cs';
    }
  }
  return '';
};

/**
 * Normalize a path by removing basePath prefix for comparison.
 * usePathname() returns path WITH basePath on GitHub Pages.
 */
export const normalizePath = (pathname: string): string => {
  const basePath = getBasePath();
  if (basePath && pathname.startsWith(basePath)) {
    return pathname.slice(basePath.length) || '/';
  }
  return pathname;
};

export default { getConfig, isProduction, getEnvironmentName, getBasePath, normalizePath };
