'use client';

import React, { useState } from 'react';
import { 
  Table, 
  Tag, 
  Typography, 
  Space, 
  Image, 
  Button, 
  Badge,
  Skeleton,
  Empty,
  Tooltip
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { 
  ExpandAltOutlined, 
  ShrinkOutlined,
  LinkOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { Product } from '../../types';
import { VariantRow } from '../VariantRow';
import { NoteEditor } from '../NoteEditor';

const { Text, Link } = Typography;

interface ProductTableProps {
  products: Product[];
  isLoading?: boolean;
  onSaveNote: (data: {
    productId: string;
    variantId?: string;
    csImportantNote?: string;
    csSpecialPoint?: string;
  }) => void;
  onDeleteNote: (productId: string, variantId?: string) => void;
  isUpdatingNote?: boolean;
}

// Helper to get localized name
const getLocalizedName = (names: { lang: string; content: string }[], langCode: string = 'eng'): string => {
  const name = names.find(n => n.lang.toLowerCase() === langCode.toLowerCase());
  return name?.content || names[0]?.content || 'N/A';
};

// Format currency
const formatCurrency = (amount: number, currency: string): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format date
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Count notes in variants
const countVariantNotes = (variants: Product['variants']): number => {
  return variants.filter(v => v.csImportantNote || v.csSpecialPoint).length;
};

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  isLoading = false,
  onSaveNote,
  onDeleteNote,
  isUpdatingNote = false,
}) => {
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);

  const handleExpandAll = () => {
    setExpandedRowKeys(products.map(p => p.productId));
  };

  const handleCollapseAll = () => {
    setExpandedRowKeys([]);
  };

  const columns: ColumnsType<Product> = [
    {
      title: 'Image',
      dataIndex: 'imageUrl',
      key: 'image',
      width: 70,
      fixed: 'left',
      render: (url: string) => (
        <Image
          src={url}
          alt="Product"
          width={50}
          height={50}
          style={{ objectFit: 'cover', borderRadius: 4 }}
          fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgesENfX4AAABOElEQVQ4jWP4////f4YBYIT//8F8XPJ4JQACAQAjqwHOAGqwHQAAAABJRU5ErkJggg=="
        />
      ),
    },
    {
      title: 'Product Info',
      key: 'info',
      width: 280,
      render: (_, record) => (
        <Space direction="vertical" size={0} style={{ width: '100%' }}>
          <Space size="small" wrap>
            <Text strong style={{ fontSize: 13 }}>
              #{record.autoId}
            </Text>
            <Link href={record.b2cLink} target="_blank" style={{ fontSize: 12 }}>
              <LinkOutlined /> View
            </Link>
          </Space>
          <Text strong style={{ fontSize: 12 }}>{getLocalizedName(record.productNames, 'eng')}</Text>
          <Text type="secondary" style={{ fontSize: 11 }}>
            {getLocalizedName(record.productNames, 'vie')}
          </Text>
          <Text type="secondary" style={{ fontSize: 11 }}>
            {getLocalizedName(record.productNames, 'kor')}
          </Text>
          <Space style={{ marginTop: 4 }} wrap size={4}>
            <Tag color="purple" style={{ fontSize: 10, margin: 0 }}>{record.categoryName}</Tag>
            <Tag color="cyan" style={{ fontSize: 10, margin: 0 }}>{record.subCategoryName}</Tag>
          </Space>
        </Space>
      ),
    },
    {
      title: 'Type & Price',
      key: 'type_price',
      width: 140,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Tag color="blue" style={{ fontSize: 10 }}>{record.productTypeName}</Tag>
          <Text strong style={{ color: '#52c41a', fontSize: 14 }}>
            {formatCurrency(record.price, record.currency)}
          </Text>
          <Space wrap style={{ marginTop: 4 }} size={2}>
            {record.languages.map(lang => (
              <Tag key={lang.code} color="geekblue" style={{ fontSize: 9, margin: 0 }}>
                {lang.code}
              </Tag>
            ))}
          </Space>
        </Space>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      width: 90,
      render: (_, record) => {
        const statusColors: Record<string, string> = {
          'PDS00000000005': 'green', // On Sale
          'PDS00000000001': 'orange', // Draft
          'PDS00000000002': 'red', // Stopped
        };
        return (
          <Tag color={statusColors[record.status.code] || 'default'} style={{ fontSize: 10 }}>
            {record.status.text}
          </Tag>
        );
      },
    },
    {
      title: 'Seller',
      key: 'seller',
      width: 120,
      render: (_, record) => (
        <Space size={4}>
          <Image
            src={record.avatarUrl}
            alt="Seller"
            width={28}
            height={28}
            style={{ borderRadius: '50%', objectFit: 'cover' }}
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
          />
          <Text ellipsis style={{ maxWidth: 80, fontSize: 12 }}>{record.sellerName}</Text>
        </Space>
      ),
    },
    {
      title: 'Variants & Notes',
      key: 'variants',
      width: 110,
      render: (_, record) => {
        const variantNoteCount = countVariantNotes(record.variants);
        const hasProductNote = record.csImportantNote || record.csSpecialPoint;
        
        return (
          <Space direction="vertical" size={2}>
            <Badge count={record.variants.length} color="blue" overflowCount={99} size="small">
              <Tag style={{ fontSize: 10 }}>Variants</Tag>
            </Badge>
            <Tooltip title={`Product has ${hasProductNote ? '' : 'no '}note. ${variantNoteCount} variant(s) with notes.`}>
              <Badge count={variantNoteCount + (hasProductNote ? 1 : 0)} color="orange" overflowCount={99} size="small">
                <Tag icon={<FileTextOutlined />} style={{ fontSize: 10 }}>Notes</Tag>
              </Badge>
            </Tooltip>
          </Space>
        );
      },
    },
    {
      title: 'Updated',
      key: 'updated',
      width: 130,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text type="secondary" style={{ fontSize: 10 }}>
            Created: {formatDate(record.createdTS)}
          </Text>
          <Text type="secondary" style={{ fontSize: 10 }}>
            Updated: {formatDate(record.lastUpdatedTS)}
          </Text>
        </Space>
      ),
    },
  ];

  // Expandable row render
  const expandedRowRender = (record: Product) => (
    <div style={{ padding: '16px 0' }}>
      {/* Product-level notes */}
      <NoteEditor
        productId={record.productId}
        csImportantNote={record.csImportantNote}
        csSpecialPoint={record.csSpecialPoint}
        onSave={onSaveNote}
        onDelete={onDeleteNote}
        isLoading={isUpdatingNote}
      />
      
      {/* Variants table */}
      {record.variants.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <Text strong style={{ marginBottom: 8, display: 'block' }}>
            Variants ({record.variants.length})
          </Text>
          <VariantRow
            variants={record.variants}
            productId={record.productId}
            onSaveNote={onSaveNote}
            onDeleteNote={onDeleteNote}
            isLoading={isUpdatingNote}
          />
        </div>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div>
        <Skeleton active paragraph={{ rows: 10 }} />
      </div>
    );
  }

  if (!products.length) {
    return (
      <Empty
        description="No products found. Please select a main category and adjust filters."
        style={{ padding: 40 }}
      />
    );
  }

  return (
    <div>
      {/* Controls */}
      <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'flex-end', gap: 8, flexWrap: 'wrap' }}>
        <Button 
          icon={<ExpandAltOutlined />} 
          onClick={handleExpandAll}
          disabled={expandedRowKeys.length === products.length}
          size="small"
        >
          Expand All
        </Button>
        <Button 
          icon={<ShrinkOutlined />} 
          onClick={handleCollapseAll}
          disabled={expandedRowKeys.length === 0}
          size="small"
        >
          Collapse All
        </Button>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={products}
        rowKey="productId"
        expandable={{
          expandedRowRender,
          expandedRowKeys,
          onExpandedRowsChange: (keys) => setExpandedRowKeys(keys as string[]),
        }}
        pagination={false}
        bordered
        scroll={{ x: 950 }}
        size="small"
      />
    </div>
  );
};

export default ProductTable;
