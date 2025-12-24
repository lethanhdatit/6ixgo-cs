// Common types used across the application

export interface ApiResponse<T> {
  message: string;
  data: T;
  ts: string;
}

export interface PaginatedData<T> {
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  items: T[];
}

export interface LocalizedName {
  lang: string;
  displayOrder: number;
  content: string;
}

export interface BaseEntity {
  id: string;
  level: number;
  code: string;
  name: string;
  displayOrder: number;
  localizedCode: string;
  localizedName: string;
}
