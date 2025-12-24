'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { productService, ApiError } from '../services';
import { ProductFilterParams, PaginatedData, Product, NoteUpdateRequest } from '../types';
import { DEFAULT_PAGE_SIZE } from '../constants';

// Helper to get error message
const getErrorMessage = (error: unknown, defaultMsg: string): string => {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    if (error.message.includes('Network Error') || error.message.includes('CORS')) {
      return 'Unable to connect to server. Please check your connection.';
    }
    return error.message;
  }
  return defaultMsg;
};

const defaultFilters: ProductFilterParams = {
  pageNumber: 1,
  pageSize: DEFAULT_PAGE_SIZE,
  mainCategoryCode: '',
};

export const useProducts = (initialMainCategory?: string) => {
  const queryClient = useQueryClient();
  
  const [filters, setFilters] = useState<ProductFilterParams>({
    ...defaultFilters,
    mainCategoryCode: initialMainCategory || '',
  });

  // Search products query
  const query = useQuery<PaginatedData<Product>>({
    queryKey: ['products', filters],
    queryFn: () => productService.searchProducts(filters),
    enabled: !!filters.mainCategoryCode, // Only fetch when mainCategoryCode is selected
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  // Update note mutation
  const updateNoteMutation = useMutation({
    mutationFn: (data: NoteUpdateRequest) => productService.updateNote(data),
    onSuccess: () => {
      message.success('Note saved successfully');
      // Invalidate and refetch products
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error) => {
      message.error(getErrorMessage(error, 'Failed to save note'));
    },
  });

  // Delete note mutation
  const deleteNoteMutation = useMutation({
    mutationFn: ({ productId, variantId }: { productId: string; variantId?: string }) => 
      productService.deleteNote(productId, variantId),
    onSuccess: () => {
      message.success('Note deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error) => {
      message.error(getErrorMessage(error, 'Failed to delete note'));
    },
  });

  // Filter update functions
  const updateFilters = useCallback((newFilters: Partial<ProductFilterParams>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      pageNumber: newFilters.pageNumber ?? 1, // Reset to page 1 when filters change
    }));
  }, []);

  const setPage = useCallback((pageNumber: number) => {
    setFilters(prev => ({ ...prev, pageNumber }));
  }, []);

  const setPageSize = useCallback((pageSize: number) => {
    setFilters(prev => ({ ...prev, pageSize, pageNumber: 1 }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(prev => ({
      ...defaultFilters,
      mainCategoryCode: prev.mainCategoryCode, // Keep main category
    }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  // Get user-friendly error message
  const errorMessage = query.error ? getErrorMessage(query.error, 'Failed to load products') : null;

  return {
    // Query state
    products: query.data?.items || [],
    totalRecords: query.data?.totalRecords || 0,
    totalPages: query.data?.totalPages || 0,
    currentPage: filters.pageNumber,
    pageSize: filters.pageSize,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    errorMessage,
    
    // Filters
    filters,
    updateFilters,
    setPage,
    setPageSize,
    resetFilters,
    clearAllFilters,
    
    // Mutations
    updateNote: updateNoteMutation.mutate,
    deleteNote: deleteNoteMutation.mutate,
    isUpdatingNote: updateNoteMutation.isPending,
    isDeletingNote: deleteNoteMutation.isPending,
    
    // Refetch
    refetch: query.refetch,
  };
};

export default useProducts;
