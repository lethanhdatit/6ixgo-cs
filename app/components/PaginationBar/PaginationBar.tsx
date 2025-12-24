'use client';

import React from 'react';
import { 
  Pagination, 
  Select, 
  Space, 
  Typography, 
  InputNumber,
  Button 
} from 'antd';
import { 
  DoubleLeftOutlined, 
  DoubleRightOutlined,
  LeftOutlined,
  RightOutlined
} from '@ant-design/icons';
import { PAGE_SIZE_OPTIONS } from '../../constants';

const { Text } = Typography;

interface PaginationBarProps {
  currentPage: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  isLoading?: boolean;
}

const PaginationBar: React.FC<PaginationBarProps> = ({
  currentPage,
  pageSize,
  totalRecords,
  totalPages,
  onPageChange,
  onPageSizeChange,
  isLoading = false,
}) => {
  const [jumpToPage, setJumpToPage] = React.useState<number | null>(null);

  const handleJumpToPage = () => {
    if (jumpToPage && jumpToPage >= 1 && jumpToPage <= totalPages) {
      onPageChange(jumpToPage);
      setJumpToPage(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleJumpToPage();
    }
  };

  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalRecords);

  return (
    <div 
      style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '12px 0',
        flexWrap: 'wrap',
        gap: 12
      }}
    >
      {/* Records info */}
      <Space>
        <Text type="secondary" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
          {startRecord} - {endRecord} of {totalRecords}
        </Text>
      </Space>

      {/* Center pagination controls */}
      <Space size={4} wrap>
        {/* First page */}
        <Button
          icon={<DoubleLeftOutlined />}
          size="small"
          disabled={currentPage === 1 || isLoading}
          onClick={() => onPageChange(1)}
          title="First Page"
        />
        
        {/* Previous page */}
        <Button
          icon={<LeftOutlined />}
          size="small"
          disabled={currentPage === 1 || isLoading}
          onClick={() => onPageChange(currentPage - 1)}
          title="Previous Page"
        />

        {/* Page numbers */}
        <Pagination
          current={currentPage}
          total={totalRecords}
          pageSize={pageSize}
          onChange={onPageChange}
          showSizeChanger={false}
          showQuickJumper={false}
          simple
          size="small"
          disabled={isLoading}
        />

        {/* Next page */}
        <Button
          icon={<RightOutlined />}
          size="small"
          disabled={currentPage === totalPages || isLoading}
          onClick={() => onPageChange(currentPage + 1)}
          title="Next Page"
        />

        {/* Last page */}
        <Button
          icon={<DoubleRightOutlined />}
          size="small"
          disabled={currentPage === totalPages || isLoading}
          onClick={() => onPageChange(totalPages)}
          title="Last Page"
        />
      </Space>

      {/* Right side controls */}
      <Space size="small" wrap>
        {/* Jump to page */}
        <Space size={4}>
          <Text type="secondary" style={{ fontSize: 12 }}>Go to:</Text>
          <InputNumber
            min={1}
            max={totalPages}
            value={jumpToPage}
            onChange={(value) => setJumpToPage(value)}
            onKeyDown={handleKeyPress}
            style={{ width: 60 }}
            size="small"
            disabled={isLoading}
          />
          <Button 
            size="small" 
            onClick={handleJumpToPage}
            disabled={!jumpToPage || jumpToPage < 1 || jumpToPage > totalPages || isLoading}
          >
            Go
          </Button>
        </Space>

        {/* Page size selector */}
        <Space size={4}>
          <Text type="secondary" style={{ fontSize: 12 }}>Per page:</Text>
          <Select
            value={pageSize}
            onChange={onPageSizeChange}
            size="small"
            style={{ width: 70 }}
            disabled={isLoading}
            options={PAGE_SIZE_OPTIONS.map(size => ({
              value: size,
              label: size.toString(),
            }))}
          />
        </Space>
      </Space>
    </div>
  );
};

export default PaginationBar;
