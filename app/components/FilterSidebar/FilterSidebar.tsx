'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
  ReloadOutlined
} from '@ant-design/icons';
import { useResources, useDebounce } from '../../hooks';
import { ProductFilterParams } from '../../types';
import {
  NUMBER_OF_PROGRESSES_OPTIONS,
  SESSIONS_PER_WEEK_OPTIONS,
  SEARCH_DEBOUNCE_MS
} from '../../constants';

const { Text } = Typography;

interface FilterSidebarProps {
  filters: ProductFilterParams;
  onFilterChange: (filters: Partial<ProductFilterParams>) => void;
  onClearAll: () => void;
  onRefreshResources?: () => Promise<void>;
  isLoading?: boolean;
  isRefreshingResources?: boolean;
}

interface PendingState {
  categoryCodes: string[];
  langCodes: string[];
  locationCodes: string[];
  progressMethodCodes: string[];
  productTypeCodes: string[];
  numberOfProgresses: number[];
  numberOfProgressPerWeeks: number[];
}

const getInitialPending = (filters: ProductFilterParams): PendingState => ({
  categoryCodes: filters.categoryCodes || [],
  langCodes: filters.langCodes || [],
  locationCodes: filters.locationCodes || [],
  progressMethodCodes: filters.progressMethodCodes || [],
  productTypeCodes: filters.productTypeCodes || [],
  numberOfProgresses: filters.numberOfProgresses || [],
  numberOfProgressPerWeeks: filters.numberOfProgressPerWeeks || [],
});

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onFilterChange,
  onClearAll,
  onRefreshResources,
  isLoading = false,
  isRefreshingResources = false,
}) => {
  const {
    mainCategories,
    getSubCategories,
    languages,
    vnLocations,
    getProductTypes,
    getProcessMethods,
    isLoading: resourcesLoading
  } = useResources();

  // Pending state for multi-select filters
  const [pending, setPending] = useState<PendingState>(() => getInitialPending(filters));
  
  // Track if filters changed externally
  const isInternalUpdate = useRef(false);

  // Search term with debounce
  const [searchInput, setSearchInput] = useState(filters.searchTerm || '');
  const debouncedSearch = useDebounce(searchInput, SEARCH_DEBOUNCE_MS);

  // Apply debounced search
  useEffect(() => {
    if (debouncedSearch !== filters.searchTerm) {
      onFilterChange({ searchTerm: debouncedSearch || undefined });
    }
  }, [debouncedSearch, filters.searchTerm, onFilterChange]);

  // Sync pending with filters only on external changes
  useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }
    setPending(getInitialPending(filters));
  }, [
    filters.categoryCodes,
    filters.langCodes,
    filters.locationCodes,
    filters.progressMethodCodes,
    filters.productTypeCodes,
    filters.numberOfProgresses,
    filters.numberOfProgressPerWeeks,
  ]);

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

  // Memoize options
  const mainCategoryOptions = useMemo(() => 
    mainCategories.map(cat => ({ value: cat.code, label: cat.localizedName })), 
    [mainCategories]
  );

  const subCategoryOptions = useMemo(() =>
    subCategories.map(cat => ({ value: cat.code, label: cat.localizedName })), 
    [subCategories]
  );

  const processMethodOptions = useMemo(() =>
    processMethods.map(pm => ({ value: pm.code, label: pm.localizedName })), 
    [processMethods]
  );

  const productTypeOptions = useMemo(() =>
    productTypes.map(pt => ({ value: pt.code, label: pt.localizedName })), 
    [productTypes]
  );

  const numberOfProgressesOptions = useMemo(() =>
    NUMBER_OF_PROGRESSES_OPTIONS.map(num => ({ value: num, label: `${num} session${num > 1 ? 's' : ''}` })), 
    []
  );

  const sessionsPerWeekOptions = useMemo(() =>
    SESSIONS_PER_WEEK_OPTIONS.map(num => ({ value: num, label: `${num} per week` })), 
    []
  );

  const languageOptions = useMemo(() =>
    languages.map(lang => ({ value: lang.code, label: lang.localizedName })), 
    [languages]
  );

  const locationOptions = useMemo(() =>
    vnLocations.map(loc => ({ value: loc.code, label: loc.fullPath })), 
    [vnLocations]
  );

  // Handlers
  const handleMainCategoryChange = useCallback((value: string) => {
    isInternalUpdate.current = true;
    setPending(prev => ({
      ...prev,
      categoryCodes: [],
      progressMethodCodes: [],
      productTypeCodes: [],
    }));
    onFilterChange({
      mainCategoryCode: value,
      categoryCodes: undefined,
      progressMethodCodes: undefined,
      productTypeCodes: undefined,
    });
  }, [onFilterChange]);

  const handlePendingChange = useCallback((field: keyof PendingState, values: string[] | number[]) => {
    setPending(prev => ({ ...prev, [field]: values }));
  }, []);

  const handleApply = useCallback((field: keyof PendingState) => {
    isInternalUpdate.current = true;
    const values = pending[field];
    onFilterChange({ [field]: values.length > 0 ? values : undefined });
  }, [pending, onFilterChange]);

  const handleClearField = useCallback((field: keyof PendingState) => {
    isInternalUpdate.current = true;
    setPending(prev => ({ ...prev, [field]: [] }));
    onFilterChange({ [field]: undefined });
  }, [onFilterChange]);

  const handleClearAll = useCallback(() => {
    setSearchInput('');
    setPending({
      categoryCodes: [],
      langCodes: [],
      locationCodes: [],
      progressMethodCodes: [],
      productTypeCodes: [],
      numberOfProgresses: [],
      numberOfProgressPerWeeks: [],
    });
    onClearAll();
  }, [onClearAll]);

  // Dropdown render with Apply/Clear buttons inside
  const renderDropdown = useCallback((menu: React.ReactElement, field: keyof PendingState) => (
    <div>
      {menu}
      <Divider style={{ margin: '8px 0' }} />
      <div style={{ padding: '0 8px 8px', display: 'flex', gap: 8 }}>
        <Button
          type="primary"
          size="small"
          block
          onClick={() => handleApply(field)}
        >
          Apply
        </Button>
        <Button
          size="small"
          onClick={() => handleClearField(field)}
        >
          Clear
        </Button>
      </div>
    </div>
  ), [handleApply, handleClearField]);

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
        <Space>
          <Tooltip title="Reload resources">
            <Button
              icon={<ReloadOutlined spin={isRefreshingResources} />}
              onClick={onRefreshResources}
              disabled={isLoading || isRefreshingResources}
              size="small"
            >
            </Button>
          </Tooltip>
          <Tooltip title="Clear all">
            <Button
              icon={<ClearOutlined />}
              onClick={handleClearAll}
              disabled={isLoading}
              size="small"
            >
              Clear All
            </Button>
          </Tooltip>
        </Space>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Search */}
        <div>
          <Text strong>Search</Text>
          <Input
            placeholder="Search products..."
            prefix={<SearchOutlined />}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            allowClear
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
            options={mainCategoryOptions}
          />
        </div>

        {/* Sub Categories */}
        <div>
          <Text strong>Sub Categories</Text>
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="All"
            value={pending.categoryCodes}
            onChange={(values) => handlePendingChange('categoryCodes', values)}
            disabled={!filters.mainCategoryCode}
            showSearch
            filterOption={(input, option) =>
              (option?.label?.toString() || '').toLowerCase().includes(input.toLowerCase())
            }
            options={subCategoryOptions}
            popupRender={(menu) => renderDropdown(menu, 'categoryCodes')}
          />
        </div>

        {/* Progress Method */}
        <div>
          <Text strong>Progress Method</Text>
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="All"
            value={pending.progressMethodCodes}
            onChange={(values) => handlePendingChange('progressMethodCodes', values)}
            disabled={!filters.mainCategoryCode}
            showSearch
            filterOption={(input, option) =>
              (option?.label?.toString() || '').toLowerCase().includes(input.toLowerCase())
            }
            options={processMethodOptions}
            popupRender={(menu) => renderDropdown(menu, 'progressMethodCodes')}
          />
        </div>

        {/* Product Type */}
        <div>
          <Text strong>Product Type</Text>
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="All"
            value={pending.productTypeCodes}
            onChange={(values) => handlePendingChange('productTypeCodes', values)}
            disabled={!filters.mainCategoryCode}
            showSearch
            filterOption={(input, option) =>
              (option?.label?.toString() || '').toLowerCase().includes(input.toLowerCase())
            }
            options={productTypeOptions}
            popupRender={(menu) => renderDropdown(menu, 'productTypeCodes')}
          />
        </div>

        {/* Number of Sessions */}
        <div>
          <Text strong>Number of Sessions</Text>
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="All"
            value={pending.numberOfProgresses}
            onChange={(values) => handlePendingChange('numberOfProgresses', values as number[])}
            showSearch
            options={numberOfProgressesOptions}
            popupRender={(menu) => renderDropdown(menu, 'numberOfProgresses')}
          />
        </div>

        {/* Sessions Per Week */}
        <div>
          <Text strong>Sessions Per Week</Text>
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="All"
            value={pending.numberOfProgressPerWeeks}
            onChange={(values) => handlePendingChange('numberOfProgressPerWeeks', values as number[])}
            showSearch
            options={sessionsPerWeekOptions}
            popupRender={(menu) => renderDropdown(menu, 'numberOfProgressPerWeeks')}
          />
        </div>

        {/* Languages */}
        <div>
          <Text strong>Languages</Text>
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="All"
            value={pending.langCodes}
            onChange={(values) => handlePendingChange('langCodes', values)}
            showSearch
            filterOption={(input, option) =>
              (option?.label?.toString() || '').toLowerCase().includes(input.toLowerCase())
            }
            options={languageOptions}
            popupRender={(menu) => renderDropdown(menu, 'langCodes')}
          />
        </div>

        {/* Locations */}
        <div>
          <Text strong>Locations</Text>
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="All"
            value={pending.locationCodes}
            onChange={(values) => handlePendingChange('locationCodes', values)}
            showSearch
            filterOption={(input, option) =>
              (option?.label?.toString() || '').toLowerCase().includes(input.toLowerCase())
            }
            options={locationOptions}
            popupRender={(menu) => renderDropdown(menu, 'locationCodes')}
          />
        </div>
      </div>
    </Card>
  );
};

export default FilterSidebar;
