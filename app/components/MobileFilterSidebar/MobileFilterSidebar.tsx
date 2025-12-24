'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Select,
  Input,
  Button,
  Space,
  Typography,
  Spin
} from 'antd';
import {
  SearchOutlined,
  ClearOutlined,
  FilterOutlined,
  ReloadOutlined,
  CheckOutlined
} from '@ant-design/icons';
import { useResources, useDebounce } from '../../hooks';
import { ProductFilterParams } from '../../types';
import {
  NUMBER_OF_PROGRESSES_OPTIONS,
  SESSIONS_PER_WEEK_OPTIONS,
  SEARCH_DEBOUNCE_MS
} from '../../constants';

const { Text } = Typography;

interface MobileFilterSidebarProps {
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

// Simplified version for mobile - no popupRender to avoid React 19 issues
const MobileFilterSidebar: React.FC<MobileFilterSidebarProps> = ({
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

  const [pending, setPending] = useState<PendingState>(() => getInitialPending(filters));
  const isInternalUpdate = useRef(false);
  const [searchInput, setSearchInput] = useState(filters.searchTerm || '');
  const debouncedSearch = useDebounce(searchInput, SEARCH_DEBOUNCE_MS);

  useEffect(() => {
    if (debouncedSearch !== filters.searchTerm) {
      onFilterChange({ searchTerm: debouncedSearch || undefined });
    }
  }, [debouncedSearch, filters.searchTerm, onFilterChange]);

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

  const mainCategoryOptions = useMemo(() => 
    mainCategories.map(cat => ({ value: cat.code, label: cat.localizedName })), [mainCategories]);
  const subCategoryOptions = useMemo(() =>
    subCategories.map(cat => ({ value: cat.code, label: cat.localizedName })), [subCategories]);
  const processMethodOptions = useMemo(() =>
    processMethods.map(pm => ({ value: pm.code, label: pm.localizedName })), [processMethods]);
  const productTypeOptions = useMemo(() =>
    productTypes.map(pt => ({ value: pt.code, label: pt.localizedName })), [productTypes]);
  const numberOfProgressesOptions = useMemo(() =>
    NUMBER_OF_PROGRESSES_OPTIONS.map(num => ({ value: num, label: `${num} session${num > 1 ? 's' : ''}` })), []);
  const sessionsPerWeekOptions = useMemo(() =>
    SESSIONS_PER_WEEK_OPTIONS.map(num => ({ value: num, label: `${num} per week` })), []);
  const languageOptions = useMemo(() =>
    languages.map(lang => ({ value: lang.code, label: lang.localizedName })), [languages]);
  const locationOptions = useMemo(() =>
    vnLocations.map(loc => ({ value: loc.code, label: loc.fullPath })), [vnLocations]);

  const handleMainCategoryChange = useCallback((value: string) => {
    isInternalUpdate.current = true;
    setPending(prev => ({ ...prev, categoryCodes: [], progressMethodCodes: [], productTypeCodes: [] }));
    onFilterChange({ mainCategoryCode: value, categoryCodes: undefined, progressMethodCodes: undefined, productTypeCodes: undefined });
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
    setPending({ categoryCodes: [], langCodes: [], locationCodes: [], progressMethodCodes: [], productTypeCodes: [], numberOfProgresses: [], numberOfProgressPerWeeks: [] });
    onClearAll();
  }, [onClearAll]);

  const hasPendingChanges = useCallback((field: keyof PendingState) => {
    const pendingVal = pending[field];
    const appliedVal = filters[field] || [];
    if (pendingVal.length !== appliedVal.length) return true;
    return JSON.stringify(pendingVal) !== JSON.stringify(appliedVal);
  }, [pending, filters]);

  const renderField = (field: keyof PendingState, label: string, options: { value: string | number; label: string }[], disabled = false) => {
    const hasChanges = hasPendingChanges(field);
    const currentValue = pending[field];
    return (
      <div style={{ marginBottom: 16 }}>
        <Text strong style={{ display: 'block', marginBottom: 4 }}>{label}</Text>
        <Select
          mode="multiple"
          style={{ width: '100%' }}
          placeholder="All"
          value={currentValue as (string | number)[]}
          onChange={(values) => handlePendingChange(field, values as string[] | number[])}
          disabled={disabled}
          showSearch
          filterOption={(input, option) => (option?.label?.toString() || '').toLowerCase().includes(input.toLowerCase())}
          options={options}
          maxTagCount="responsive"
        />
        {(currentValue.length > 0 || hasChanges) && (
          <Space style={{ marginTop: 8 }}>
            <Button type="primary" size="small" icon={<CheckOutlined />} onClick={() => handleApply(field)} disabled={!hasChanges}>Apply</Button>
            <Button size="small" onClick={() => handleClearField(field)} disabled={currentValue.length === 0}>Clear</Button>
          </Space>
        )}
      </div>
    );
  };

  if (resourcesLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Loading resources...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      {/* Header Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Space>
          <FilterOutlined />
          <Text strong>Filters</Text>
        </Space>
        <Space>
          <Button icon={<ReloadOutlined spin={isRefreshingResources} />} onClick={onRefreshResources} disabled={isLoading || isRefreshingResources} size="small">Reload</Button>
          <Button icon={<ClearOutlined />} onClick={handleClearAll} disabled={isLoading} size="small">Clear All</Button>
        </Space>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 16 }}>
        <Text strong style={{ display: 'block', marginBottom: 4 }}>Search</Text>
        <Input placeholder="Search products..." prefix={<SearchOutlined />} value={searchInput} onChange={(e) => setSearchInput(e.target.value)} allowClear />
      </div>

      {/* Main Category */}
      <div style={{ marginBottom: 16 }}>
        <Text strong style={{ color: '#ff4d4f', display: 'block', marginBottom: 4 }}>* Main Category</Text>
        <Select
          style={{ width: '100%' }}
          placeholder="Select main category"
          value={filters.mainCategoryCode || undefined}
          onChange={handleMainCategoryChange}
          loading={resourcesLoading}
          showSearch
          filterOption={(input, option) => (option?.label?.toString() || '').toLowerCase().includes(input.toLowerCase())}
          options={mainCategoryOptions}
        />
      </div>

      {renderField('categoryCodes', 'Sub Categories', subCategoryOptions, !filters.mainCategoryCode)}
      {renderField('progressMethodCodes', 'Progress Method', processMethodOptions, !filters.mainCategoryCode)}
      {renderField('productTypeCodes', 'Product Type', productTypeOptions, !filters.mainCategoryCode)}
      {renderField('numberOfProgresses', 'Number of Sessions', numberOfProgressesOptions)}
      {renderField('numberOfProgressPerWeeks', 'Sessions Per Week', sessionsPerWeekOptions)}
      {renderField('langCodes', 'Languages', languageOptions)}
      {renderField('locationCodes', 'Locations', locationOptions)}
    </div>
  );
};

export default MobileFilterSidebar;
