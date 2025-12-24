// Resource types for categories, languages, locations, etc.

import { BaseEntity } from './common';

export interface Category extends BaseEntity {
  type: string;
  imageUrl?: string;
  imageMoUrl?: string;
  gnbDisplayOrder: number;
  children: Category[];
  description?: string;
}

export interface Language extends BaseEntity {
  children: Language[];
}

export interface Location extends BaseEntity {
  children: Location[];
  ext?: string;
  description?: string;
  metaValue?: string;
  localizedDescription?: string;
}

export interface ProductType extends BaseEntity {
  children: ProductType[];
  metaValue?: string;
}

export interface ProcessMethod extends BaseEntity {
  children: ProcessMethod[];
  metaValue?: string;
}

export interface ResourcesData {
  categories: Category[];
  languages: Language[];
  locations: Location[];
  productTypes: Record<string, ProductType[]>;
  processMethods: Record<string, ProcessMethod[]>;
}

// Flattened category for easier use in filters
export interface FlatCategory {
  id: string;
  code: string;
  name: string;
  localizedName: string;
  level: number;
  parentCode?: string;
  isMainCategory: boolean;
}

// Flattened location for easier use in filters
export interface FlatLocation {
  id: string;
  code: string;
  name: string;
  localizedName: string;
  level: number;
  parentCode?: string;
  fullPath: string;
}
