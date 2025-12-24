'use client';

import React from 'react';
import { Layout, Typography, Spin, Alert } from 'antd';
import { 
  FilterSidebar, 
  ProductTable, 
  PaginationBar,
  AppHeader,
  ProtectedRoute
} from './components';
import { useProducts, useResources } from './hooks';

const { Content, Sider } = Layout;
const { Title } = Typography;

const ProductSearchPage: React.FC = () => {
  const { isLoading: resourcesLoading, errorMessage: resourcesErrorMessage } = useResources();
  
  const {
    products,
    totalRecords,
    totalPages,
    currentPage,
    pageSize,
    isLoading,
    isFetching,
    errorMessage,
    filters,
    updateFilters,
    setPage,
    setPageSize,
    resetFilters,
    updateNote,
    deleteNote,
    isUpdatingNote,
  } = useProducts();

  const handleSaveNote = (data: {
    productId: string;
    variantId?: string;
    csImportantNote?: string;
    csSpecialPoint?: string;
  }) => {
    updateNote(data);
  };

  const handleDeleteNote = (productId: string, variantId?: string) => {
    deleteNote({ productId, variantId });
  };

  if (resourcesLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <Spin size="large" tip="Loading resources..." />
      </div>
    );
  }

  if (resourcesErrorMessage) {
    return (
      <div style={{ padding: 24 }}>
        <Alert 
          type="error" 
          message="Failed to load resources" 
          description={resourcesErrorMessage}
          showIcon
        />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <Layout style={{ minHeight: '100vh' }}>
        <AppHeader />
        
        <Layout>
          {/* Sidebar with filters */}
          <Sider 
            width={320} 
            style={{ 
              background: '#f5f5f5',
              overflow: 'auto',
              height: 'calc(100vh - 64px)',
              position: 'sticky',
              top: 64,
              left: 0,
            }}
          >
            <div style={{ padding: 16 }}>
              <FilterSidebar
                filters={filters}
                onFilterChange={updateFilters}
                onClearAll={resetFilters}
                isLoading={isLoading || isFetching}
              />
            </div>
          </Sider>

          {/* Main content */}
          <Content style={{ padding: 24, background: '#fff' }}>
            <div style={{ marginBottom: 16 }}>
              <Title level={4} style={{ margin: 0 }}>
                CS Product Search
              </Title>
              {filters.mainCategoryCode && (
                <Typography.Text type="secondary">
                  {totalRecords} products found
                </Typography.Text>
              )}
            </div>

            {errorMessage && (
              <Alert 
                type="error" 
                message="Failed to load products" 
                description={errorMessage}
                style={{ marginBottom: 16 }}
                showIcon
                closable
              />
            )}

            {/* Products Table */}
            <ProductTable
              products={products}
              isLoading={isLoading}
              onSaveNote={handleSaveNote}
              onDeleteNote={handleDeleteNote}
              isUpdatingNote={isUpdatingNote}
            />

            {/* Pagination */}
            {products.length > 0 && (
              <PaginationBar
                currentPage={currentPage}
                pageSize={pageSize}
                totalRecords={totalRecords}
                totalPages={totalPages}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
                isLoading={isFetching}
              />
            )}
          </Content>
        </Layout>
      </Layout>
    </ProtectedRoute>
  );
};

export default ProductSearchPage;
