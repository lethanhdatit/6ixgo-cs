import { resourceApi } from './api';
import { ApiResponse, ResourcesData } from '../types';

const RESOURCES_CACHE_KEY = '6ixgo_resources';
const RESOURCES_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

interface CachedResources {
  data: ResourcesData;
  timestamp: number;
}

export const resourceService = {
  // Get resources with local storage caching
  getResources: async (forceRefresh = false): Promise<ResourcesData> => {
    // Check cache first
    if (!forceRefresh && typeof window !== 'undefined') {
      const cached = localStorage.getItem(RESOURCES_CACHE_KEY);
      if (cached) {
        try {
          const parsedCache: CachedResources = JSON.parse(cached);
          const isExpired = Date.now() - parsedCache.timestamp > RESOURCES_CACHE_TTL;
          if (!isExpired) {
            return parsedCache.data;
          }
        } catch {
          // Invalid cache, continue to fetch
        }
      }
    }

    // Fetch from API
    const response = await resourceApi.get<ApiResponse<ResourcesData>>('/resources');
    const data = response.data.data;

    // Cache the response
    if (typeof window !== 'undefined') {
      const cacheData: CachedResources = {
        data,
        timestamp: Date.now(),
      };
      localStorage.setItem(RESOURCES_CACHE_KEY, JSON.stringify(cacheData));
    }

    return data;
  },

  // Clear resources cache
  clearCache: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(RESOURCES_CACHE_KEY);
    }
  },
};

export default resourceService;
