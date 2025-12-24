'use client';

import React, { useState, useCallback } from 'react';
import { Layout, Typography, Spin, Alert, Button, Drawer, message } from 'antd';
import { FilterOutlined } from '@ant-design/icons';
import { 
  FilterSidebar,
  MobileFilterSidebar,
  ProductTable, 
  PaginationBar,
  AppHeader,
  ProtectedRoute
} from './components';
import { useProducts, useResources } from './hooks';

const { Content, Sider } = Layout;
const { Title } = Typography;

const ProductSearchPage: React.FC = () => {
  const { 
    isLoading: resourcesLoading, 
    errorMessage: resourcesErrorMessage,
    refreshResources,
    isFetching: isRefreshingResources
  } = useResources();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Handler for refreshing resources
  const handleRefreshResources = useCallback(async () => {
    try {
      await refreshResources();
      message.success('Resources refreshed successfully!');
    } catch (error) {
      message.error('Failed to refresh resources');
      console.error('Failed to refresh resources:', error);
    }
  }, [refreshResources]);
  
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
        minHeight: '100vh',
        flexDirection: 'column',
        gap: 16
      }}>
        <Spin size="large" />
        <span>Loading resources...</span>
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
      <Layout className="app-layout">
        <AppHeader />
        
        <Layout>
          {/* Desktop Sidebar with filters */}
          <Sider 
            width={300} 
            className="app-sider"
            breakpoint="lg"
            collapsedWidth={0}
            trigger={null}
          >
            <div style={{ padding: 12 }}>
              <FilterSidebar
                filters={filters}
                onFilterChange={updateFilters}
                onClearAll={resetFilters}
                onRefreshResources={handleRefreshResources}
                isLoading={isLoading || isFetching}
                isRefreshingResources={isRefreshingResources}
              />
            </div>
          </Sider>

          {/* Mobile Filter Drawer */}
          <Drawer
            title="Filters"
            placement="left"
            onClose={() => setMobileFilterOpen(false)}
            open={mobileFilterOpen}
            destroyOnClose
            className="filter-drawer"
          >
            {mobileFilterOpen && (
              <MobileFilterSidebar
                filters={filters}
                onFilterChange={(newFilters) => {
                  updateFilters(newFilters);
                }}
                onClearAll={() => {
                  resetFilters();
                  setMobileFilterOpen(false);
                }}
                onRefreshResources={handleRefreshResources}
                isLoading={isLoading || isFetching}
                isRefreshingResources={isRefreshingResources}
              />
            )}
          </Drawer>

          {/* Main content */}
          <Content className="app-content">
            <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <div>
                <Title level={4} style={{ margin: 0 }}>
                  CS Product Search
                </Title>
                {filters.mainCategoryCode && (
                  <Typography.Text type="secondary">
                    {totalRecords} products found
                  </Typography.Text>
                )}
              </div>
              
              {/* Mobile Filter Button */}
              <Button 
                type="primary"
                icon={<FilterOutlined />}
                onClick={() => setMobileFilterOpen(true)}
                className="mobile-filter-btn"
              >
                Filters
              </Button>
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
            <div className="product-table">
              <ProductTable
                products={products}
                isLoading={isLoading}
                onSaveNote={handleSaveNote}
                onDeleteNote={handleDeleteNote}
                isUpdatingNote={isUpdatingNote}
              />
            </div>

            {/* Pagination */}
            {products.length > 0 && (
              <div className="pagination-bar">
                <PaginationBar
                  currentPage={currentPage}
                  pageSize={pageSize}
                  totalRecords={totalRecords}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  onPageSizeChange={setPageSize}
                  isLoading={isFetching}
                />
              </div>
            )}
          </Content>
        </Layout>
      </Layout>
    </ProtectedRoute>
  );
};

export default ProductSearchPage;
