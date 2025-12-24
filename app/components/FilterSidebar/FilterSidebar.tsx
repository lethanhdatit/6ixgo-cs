'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Card, 
  Select, 
  Input, 
  Button, 
  Space, 
  Typography, 
  Divider,
  Tooltip,
  Spin
} from 'antd';
import { 
  SearchOutlined, 
  ClearOutlined, 
  FilterOutlined,
  CloseCircleOutlined 
} from '@ant-design/icons';
import { useResources, useDebounce } from '../../hooks';
import { ProductFilterParams } from '../../types';
import { 
  NUMBER_OF_PROGRESSES_OPTIONS, 
  SESSIONS_PER_WEEK_OPTIONS,
  SEARCH_DEBOUNCE_MS 
} from '../../constants';

const { Title, Text } = Typography;

interface FilterSidebarProps {
  filters: ProductFilterParams;
  onFilterChange: (filters: Partial<ProductFilterParams>) => void;
  onClearAll: () => void;
  isLoading?: boolean;
}

interface MultiSelectState {
  categoryCodes: string[];
  langCodes: string[];
  locationCodes: string[];
  progressMethodCodes: string[];
  productTypeCodes: string[];
  numberOfProgresses: number[];
  numberOfProgressPerWeeks: number[];
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onFilterChange,
  onClearAll,
  isLoading = false,
}) => {
  const { 
    mainCategories, 
    getSubCategories, 
    languages, 
    cities,
    getProductTypes,
    getProcessMethods,
    isLoading: resourcesLoading 
  } = useResources();

  // Local state for multi-select (pending values before applying)
  const [pendingSelections, setPendingSelections] = useState<MultiSelectState>({
    categoryCodes: filters.categoryCodes || [],
    langCodes: filters.langCodes || [],
    locationCodes: filters.locationCodes || [],
    progressMethodCodes: filters.progressMethodCodes || [],
    productTypeCodes: filters.productTypeCodes || [],
    numberOfProgresses: filters.numberOfProgresses || [],
    numberOfProgressPerWeeks: filters.numberOfProgressPerWeeks || [],
  });

  // Search term with debounce
  const [searchInput, setSearchInput] = useState(filters.searchTerm || '');
  const debouncedSearch = useDebounce(searchInput, SEARCH_DEBOUNCE_MS);

  // Apply debounced search
  useEffect(() => {
    if (debouncedSearch !== filters.searchTerm) {
      onFilterChange({ searchTerm: debouncedSearch || undefined });
    }
  }, [debouncedSearch, filters.searchTerm, onFilterChange]);

  // Sync pending selections with filters when filters change externally
  useEffect(() => {
    setPendingSelections({
      categoryCodes: filters.categoryCodes || [],
      langCodes: filters.langCodes || [],
      locationCodes: filters.locationCodes || [],
      progressMethodCodes: filters.progressMethodCodes || [],
      productTypeCodes: filters.productTypeCodes || [],
      numberOfProgresses: filters.numberOfProgresses || [],
      numberOfProgressPerWeeks: filters.numberOfProgressPerWeeks || [],
    });
  }, [filters]);

  // Dependent options based on main category
  const subCategories = useMemo(() => {
    if (!filters.mainCategoryCode) return [];
    return getSubCategories(filters.mainCategoryCode);
  }, [filters.mainCategoryCode, getSubCategories]);

  const productTypes = useMemo(() => {
    if (!filters.mainCategoryCode) return [];
    return getProductTypes(filters.mainCategoryCode);
  }, [filters.mainCategoryCode, getProductTypes]);

  const processMethods = useMemo(() => {
    if (!filters.mainCategoryCode) return [];
    return getProcessMethods(filters.mainCategoryCode);
  }, [filters.mainCategoryCode, getProcessMethods]);

  // Handlers
  const handleMainCategoryChange = (value: string) => {
    // Reset dependent filters when main category changes
    onFilterChange({
      mainCategoryCode: value,
      categoryCodes: undefined,
      progressMethodCodes: undefined,
      productTypeCodes: undefined,
    });
    setPendingSelections(prev => ({
      ...prev,
      categoryCodes: [],
      progressMethodCodes: [],
      productTypeCodes: [],
    }));
  };

  const handlePendingChange = (field: keyof MultiSelectState, values: string[] | number[]) => {
    setPendingSelections(prev => ({
      ...prev,
      [field]: values,
    }));
  };

  const applyMultiSelect = (field: keyof MultiSelectState) => {
    const values = pendingSelections[field];
    onFilterChange({
      [field]: values.length > 0 ? values : undefined,
    });
  };

  const clearSingleFilter = (field: keyof MultiSelectState) => {
    setPendingSelections(prev => ({
      ...prev,
      [field]: [],
    }));
    onFilterChange({
      [field]: undefined,
    });
  };

  const handleClearAll = () => {
    setSearchInput('');
    setPendingSelections({
      categoryCodes: [],
      langCodes: [],
      locationCodes: [],
      progressMethodCodes: [],
      productTypeCodes: [],
      numberOfProgresses: [],
      numberOfProgressPerWeeks: [],
    });
    onClearAll();
  };

  // Multi-select dropdown render with Apply button
  const renderMultiSelectDropdown = (menu: React.ReactElement, field: keyof MultiSelectState) => (
    <div>
      {menu}
      <Divider style={{ margin: '8px 0' }} />
      <div style={{ padding: '0 8px 8px', display: 'flex', gap: 8 }}>
        <Button 
          type="primary" 
          size="small" 
          block
          onClick={() => applyMultiSelect(field)}
        >
          Apply
        </Button>
        <Button 
          size="small"
          onClick={() => clearSingleFilter(field)}
        >
          Clear
        </Button>
      </div>
    </div>
  );

  if (resourcesLoading) {
    return (
      <Card className="filter-sidebar">
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>Loading resources...</div>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      className="filter-sidebar"
      title={
        <Space>
          <FilterOutlined />
          <span>Filters</span>
        </Space>
      }
      extra={
        <Tooltip title="Clear all filters">
          <Button 
            icon={<ClearOutlined />} 
            onClick={handleClearAll}
            disabled={isLoading}
          >
            Clear All
          </Button>
        </Tooltip>
      }
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {/* Search */}
        <div>
          <Text strong>Search</Text>
          <Input
            placeholder="Search products..."
            prefix={<SearchOutlined />}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            allowClear
            suffix={
              searchInput && (
                <CloseCircleOutlined 
                  onClick={() => setSearchInput('')}
                  style={{ cursor: 'pointer', color: '#999' }}
                />
              )
            }
          />
        </div>

        {/* Main Category (Required) */}
        <div>
          <Text strong style={{ color: '#ff4d4f' }}>* Main Category</Text>
          <Select
            style={{ width: '100%' }}
            placeholder="Select main category"
            value={filters.mainCategoryCode || undefined}
            onChange={handleMainCategoryChange}
            loading={resourcesLoading}
            showSearch
            filterOption={(input, option) =>
              (option?.label?.toString() || '').toLowerCase().includes(input.toLowerCase())
            }
            options={mainCategories.map(cat => ({
              value: cat.code,
              label: cat.localizedName,
            }))}
          />
        </div>

        {/* Sub Categories */}
        <div>
          <Text strong>Sub Categories</Text>
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="All"
            value={pendingSelections.categoryCodes}
            onChange={(values) => handlePendingChange('categoryCodes', values)}
            disabled={!filters.mainCategoryCode}
            showSearch
            filterOption={(input, option) =>
              (option?.label?.toString() || '').toLowerCase().includes(input.toLowerCase())
            }
            options={subCategories.map(cat => ({
              value: cat.code,
              label: cat.localizedName,
            }))}
            dropdownRender={(menu) => renderMultiSelectDropdown(menu, 'categoryCodes')}
          />
        </div>

        {/* Languages */}
        <div>
          <Text strong>Languages</Text>
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="All"
            value={pendingSelections.langCodes}
            onChange={(values) => handlePendingChange('langCodes', values)}
            showSearch
            filterOption={(input, option) =>
              (option?.label?.toString() || '').toLowerCase().includes(input.toLowerCase())
            }
            options={languages.map(lang => ({
              value: lang.code,
              label: lang.localizedName,
            }))}
            dropdownRender={(menu) => renderMultiSelectDropdown(menu, 'langCodes')}
          />
        </div>

        {/* Locations */}
        <div>
          <Text strong>Locations</Text>
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="All"
            value={pendingSelections.locationCodes}
            onChange={(values) => handlePendingChange('locationCodes', values)}
            showSearch
            filterOption={(input, option) =>
              (option?.label?.toString() || '').toLowerCase().includes(input.toLowerCase())
            }
            options={cities.map(loc => ({
              value: loc.code,
              label: loc.fullPath,
            }))}
            dropdownRender={(menu) => renderMultiSelectDropdown(menu, 'locationCodes')}
          />
        </div>

        {/* Progress Method */}
        <div>
          <Text strong>Progress Method</Text>
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="All"
            value={pendingSelections.progressMethodCodes}
            onChange={(values) => handlePendingChange('progressMethodCodes', values)}
            disabled={!filters.mainCategoryCode}
            showSearch
            filterOption={(input, option) =>
              (option?.label?.toString() || '').toLowerCase().includes(input.toLowerCase())
            }
            options={processMethods.map(pm => ({
              value: pm.code,
              label: pm.localizedName,
            }))}
            dropdownRender={(menu) => renderMultiSelectDropdown(menu, 'progressMethodCodes')}
          />
        </div>

        {/* Product Type */}
        <div>
          <Text strong>Product Type</Text>
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="All"
            value={pendingSelections.productTypeCodes}
            onChange={(values) => handlePendingChange('productTypeCodes', values)}
            disabled={!filters.mainCategoryCode}
            showSearch
            filterOption={(input, option) =>
              (option?.label?.toString() || '').toLowerCase().includes(input.toLowerCase())
            }
            options={productTypes.map(pt => ({
              value: pt.code,
              label: pt.localizedName,
            }))}
            dropdownRender={(menu) => renderMultiSelectDropdown(menu, 'productTypeCodes')}
          />
        </div>

        {/* Number of Sessions */}
        <div>
          <Text strong>Number of Sessions</Text>
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="All"
            value={pendingSelections.numberOfProgresses}
            onChange={(values) => handlePendingChange('numberOfProgresses', values as number[])}
            showSearch
            options={NUMBER_OF_PROGRESSES_OPTIONS.map(num => ({
              value: num,
              label: `${num} session${num > 1 ? 's' : ''}`,
            }))}
            dropdownRender={(menu) => renderMultiSelectDropdown(menu, 'numberOfProgresses')}
          />
        </div>

        {/* Sessions Per Week */}
        <div>
          <Text strong>Sessions Per Week</Text>
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="All"
            value={pendingSelections.numberOfProgressPerWeeks}
            onChange={(values) => handlePendingChange('numberOfProgressPerWeeks', values as number[])}
            showSearch
            options={SESSIONS_PER_WEEK_OPTIONS.map(num => ({
              value: num,
              label: `${num} per week`,
            }))}
            dropdownRender={(menu) => renderMultiSelectDropdown(menu, 'numberOfProgressPerWeeks')}
          />
        </div>
      </Space>
    </Card>
  );
};

export default FilterSidebar;
