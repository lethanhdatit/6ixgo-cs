'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { resourceService, ApiError } from '../services';
import { 
  ResourcesData, 
  Category, 
  FlatCategory, 
  FlatLocation, 
  Location 
} from '../types';

// Helper function to flatten categories
const flattenCategories = (
  categories: Category[],
  parentCode?: string,
  level = 0
): FlatCategory[] => {
  const result: FlatCategory[] = [];
  
  for (const category of categories) {
    // Find main categories (those with type 'GNB' and specific codes starting with CTG10)
    const isMainCategory = category.code.startsWith('CTG10') && level <= 1;
    
    result.push({
      id: category.id,
      code: category.code,
      name: category.name,
      localizedName: category.localizedName,
      level,
      parentCode,
      isMainCategory,
    });
    
    if (category.children?.length) {
      result.push(...flattenCategories(category.children, category.code, level + 1));
    }
  }
  
  return result;
};

// Helper function to flatten locations
const flattenLocations = (
  locations: Location[],
  parentCode?: string,
  path: string[] = []
): FlatLocation[] => {
  const result: FlatLocation[] = [];
  
  for (const location of locations) {
    const currentPath = [...path, location.localizedName];
    
    result.push({
      id: location.id,
      code: location.code,
      name: location.name,
      localizedName: location.localizedName,
      level: location.level,
      parentCode,
      fullPath: currentPath.join(' > '),
    });
    
    if (location.children?.length) {
      result.push(...flattenLocations(location.children, location.code, currentPath));
    }
  }
  
  return result;
};

// Extract Vietnam locations (cities level 2 and districts level 3)
const extractVietnamLocations = (locations: Location[]): FlatLocation[] => {
  const result: FlatLocation[] = [];
  
  // Find Vietnam (code = 'VNM')
  const vietnam = locations.find(loc => loc.code === 'VNM');
  if (!vietnam || !vietnam.children?.length) return result;
  
  // Iterate through cities (level 2)
  for (const city of vietnam.children) {
    result.push({
      id: city.id,
      code: city.code,
      name: city.name,
      localizedName: city.localizedName,
      level: city.level,
      parentCode: 'VNM',
      fullPath: city.localizedName,
    });
    
    // Iterate through districts (level 3)
    if (city.children?.length) {
      for (const district of city.children) {
        result.push({
          id: district.id,
          code: district.code,
          name: district.name,
          localizedName: district.localizedName,
          level: district.level,
          parentCode: city.code,
          fullPath: `${city.localizedName} > ${district.localizedName}`,
        });
      }
    }
  }
  
  return result;
};

// Extract main categories from the nested structure
const extractMainCategories = (categories: Category[]): FlatCategory[] => {
  const mainCategories: FlatCategory[] = [];
  
  const findMainCategories = (cats: Category[]) => {
    for (const cat of cats) {
      // Main categories are those with code starting with CTG10 (e.g., CTG10000000001 for Classes)
      if (cat.code.startsWith('CTG10')) {
        mainCategories.push({
          id: cat.id,
          code: cat.code,
          name: cat.name,
          localizedName: cat.localizedName,
          level: 0,
          isMainCategory: true,
        });
      }
      if (cat.children?.length) {
        findMainCategories(cat.children);
      }
    }
  };
  
  findMainCategories(categories);
  return mainCategories;
};

// Extract subcategories for a main category
const extractSubCategories = (categories: Category[], mainCategoryCode: string): FlatCategory[] => {
  const subCategories: FlatCategory[] = [];
  
  const findMainAndExtractSubs = (cats: Category[]) => {
    for (const cat of cats) {
      if (cat.code === mainCategoryCode && cat.children?.length) {
        // Found the main category, extract its children (subcategories)
        for (const sub of cat.children) {
          subCategories.push({
            id: sub.id,
            code: sub.code,
            name: sub.name,
            localizedName: sub.localizedName,
            level: 1,
            parentCode: mainCategoryCode,
            isMainCategory: false,
          });
          // Also include deeper nested categories
          if (sub.children?.length) {
            subCategories.push(...flattenCategories(sub.children, sub.code, 2));
          }
        }
      }
      if (cat.children?.length) {
        findMainAndExtractSubs(cat.children);
      }
    }
  };
  
  findMainAndExtractSubs(categories);
  return subCategories;
};

export const useResources = () => {
  const queryClient = useQueryClient();
  
  const query = useQuery<ResourcesData>({
    queryKey: ['resources'],
    queryFn: () => resourceService.getResources(),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    gcTime: 24 * 60 * 60 * 1000, // 24 hours (formerly cacheTime)
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Force refresh resources from API
  const refreshResources = async () => {
    resourceService.clearCache();
    await queryClient.invalidateQueries({ queryKey: ['resources'] });
    return query.refetch();
  };

  const resources = query.data;

  // Derived data
  const mainCategories = resources 
    ? extractMainCategories(resources.categories) 
    : [];

  const getSubCategories = (mainCategoryCode: string) => {
    if (!resources) return [];
    return extractSubCategories(resources.categories, mainCategoryCode);
  };

  const flatCategories = resources 
    ? flattenCategories(resources.categories) 
    : [];

  const languages = resources?.languages || [];

  const flatLocations = resources 
    ? flattenLocations(resources.locations)
    : [];

  // Get Vietnam locations only (cities level 2 and districts level 3)
  const vnLocations = resources 
    ? extractVietnamLocations(resources.locations)
    : [];

  const getProductTypes = (mainCategoryCode: string) => {
    if (!resources) return [];
    return resources.productTypes[mainCategoryCode] || [];
  };

  const getProcessMethods = (mainCategoryCode: string) => {
    if (!resources) return [];
    return resources.processMethods[mainCategoryCode] || [];
  };

  // Get user-friendly error message
  const getErrorMessage = (): string | null => {
    if (!query.error) return null;
    if (query.error instanceof ApiError) {
      return query.error.message;
    }
    if (query.error instanceof Error) {
      if (query.error.message.includes('Network Error') || query.error.message.includes('CORS')) {
        return 'Unable to connect to server. Please check your connection.';
      }
      return query.error.message;
    }
    return 'Failed to load resources';
  };

  return {
    ...query,
    resources,
    mainCategories,
    getSubCategories,
    flatCategories,
    languages,
    flatLocations,
    vnLocations,
    getProductTypes,
    getProcessMethods,
    errorMessage: getErrorMessage(),
    refreshResources,
  };
};

export default useResources;
