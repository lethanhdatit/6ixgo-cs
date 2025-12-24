// Product and Variant types

import { LocalizedName } from './common';

export interface ProductLanguage {
  code: string;
  name: string;
}

export interface ProductStatus {
  code: string;
  text: string;
}

export interface Variant {
  id: string;
  displayOrder: number;
  names: LocalizedName[];
  csImportantNote?: string;
  csSpecialPoint?: string;
  progressMethodName?: string;
  numberOfProgressesName?: string;
  numberOfProgressesPerWeekName?: string;
  progressTimeName?: string;
  districtName?: string;
  cityName?: string;
  originalPrice: number;
  price: number;
  currency: string;
  eventInUse: boolean;
  eventLimit: number;
  eventBookedCount: number;
}

export interface Product {
  productId: string;
  autoId: number;
  b2cLink: string;
  type: string;
  categoryName: string;
  subCategoryName: string;
  imageUrl: string;
  name: string;
  csImportantNote?: string;
  csSpecialPoint?: string;
  productNames: LocalizedName[];
  productTypeName: string;
  price: number;
  languages: ProductLanguage[];
  currency: string;
  status: ProductStatus;
  sellerName: string;
  avatarUrl: string;
  createdTS: string;
  lastUpdatedTS: string;
  variants: Variant[];
}

// Filter parameters for product search
export interface ProductFilterParams {
  pageNumber: number;
  pageSize: number;
  mainCategoryCode: string;
  categoryCodes?: string[];
  langCodes?: string[];
  locationCodes?: string[];
  progressMethodCodes?: string[];
  productTypeCodes?: string[];
  numberOfProgresses?: number[];
  numberOfProgressPerWeeks?: number[];
  searchTerm?: string;
}

// Note update request
export interface NoteUpdateRequest {
  productId: string;
  variantId?: string;
  csImportantNote?: string;
  csSpecialPoint?: string;
}
