import { adminApi } from './api';
import { 
  ApiResponse, 
  PaginatedData, 
  Product, 
  ProductFilterParams,
  NoteUpdateRequest 
} from '../types';

export const productService = {
  // Search products with filters
  searchProducts: async (params: ProductFilterParams): Promise<PaginatedData<Product>> => {
    // Build query params
    const queryParams = new URLSearchParams();
    
    queryParams.append('pageNumber', params.pageNumber.toString());
    queryParams.append('pageSize', params.pageSize.toString());
    queryParams.append('mainCategoryCode', params.mainCategoryCode);
    
    // Add array params (multi-select filters)
    if (params.categoryCodes?.length) {
      params.categoryCodes.forEach(code => queryParams.append('categoryCodes', code));
    }
    if (params.langCodes?.length) {
      params.langCodes.forEach(code => queryParams.append('langCodes', code));
    }
    if (params.locationCodes?.length) {
      params.locationCodes.forEach(code => queryParams.append('locationCodes', code));
    }
    if (params.progressMethodCodes?.length) {
      params.progressMethodCodes.forEach(code => queryParams.append('progressMethodCodes', code));
    }
    if (params.productTypeCodes?.length) {
      params.productTypeCodes.forEach(code => queryParams.append('productTypeCodes', code));
    }
    if (params.numberOfProgresses?.length) {
      params.numberOfProgresses.forEach(num => queryParams.append('numberOfProgresses', num.toString()));
    }
    if (params.numberOfProgressPerWeeks?.length) {
      params.numberOfProgressPerWeeks.forEach(num => queryParams.append('numberOfProgressPerWeeks', num.toString()));
    }
    if (params.searchTerm) {
      queryParams.append('searchTerm', params.searchTerm);
    }

    const response = await adminApi.get<ApiResponse<PaginatedData<Product>>>(`/products/cs?${queryParams.toString()}`);
    return response.data.data;
  },

  // Update notes for product or variant
  updateNote: async (noteData: NoteUpdateRequest): Promise<ApiResponse<unknown>> => {
    const response = await adminApi.post<ApiResponse<unknown>>('/products/cs', {
      data: noteData,
    });
    return response.data;
  },

  // Delete notes (set to empty/null)
  deleteNote: async (productId: string, variantId?: string): Promise<ApiResponse<unknown>> => {
    return productService.updateNote({
      productId,
      variantId,
      csImportantNote: '',
      csSpecialPoint: '',
    });
  },
};

export default productService;
