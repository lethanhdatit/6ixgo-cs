'use client';

import React from 'react';
import { Table, Tag, Typography, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Variant } from '../../types';
import { NoteEditor } from '../NoteEditor';

const { Text } = Typography;

interface VariantRowProps {
  variants: Variant[];
  onSaveNote: (data: {
    productId: string;
    variantId?: string;
    csImportantNote?: string;
    csSpecialPoint?: string;
  }) => void;
  onDeleteNote: (productId: string, variantId?: string) => void;
  productId: string;
  isLoading?: boolean;
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

const VariantRow: React.FC<VariantRowProps> = ({
  variants,
  onSaveNote,
  onDeleteNote,
  productId,
  isLoading = false,
}) => {
  const columns: ColumnsType<Variant> = [
    {
      title: '#',
      dataIndex: 'displayOrder',
      key: 'displayOrder',
      width: 50,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Variant Name',
      key: 'name',
      width: 300,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{getLocalizedName(record.names, 'eng')}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {getLocalizedName(record.names, 'vie')}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {getLocalizedName(record.names, 'kor')}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Progress',
      key: 'progress',
      width: 180,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          {record.progressMethodName && (
            <Tag color="blue">{record.progressMethodName}</Tag>
          )}
          {record.numberOfProgressesName && (
            <Text style={{ fontSize: 12 }}>{record.numberOfProgressesName}</Text>
          )}
          {record.numberOfProgressesPerWeekName && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.numberOfProgressesPerWeekName}
            </Text>
          )}
          {record.progressTimeName && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              Duration: {record.progressTimeName}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Location',
      key: 'location',
      width: 150,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          {record.cityName && <Text>{record.cityName}</Text>}
          {record.districtName && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.districtName}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Price',
      key: 'price',
      width: 150,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong style={{ color: '#52c41a' }}>
            {formatCurrency(record.price, record.currency)}
          </Text>
          {record.originalPrice !== record.price && (
            <Text delete type="secondary" style={{ fontSize: 12 }}>
              {formatCurrency(record.originalPrice, record.currency)}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Event',
      key: 'event',
      width: 100,
      render: (_, record) => (
        record.eventInUse ? (
          <Space direction="vertical" size={0}>
            <Tag color="orange">Event Active</Tag>
            <Text style={{ fontSize: 12 }}>
              {record.eventBookedCount}/{record.eventLimit}
            </Text>
          </Space>
        ) : (
          <Tag color="default">No Event</Tag>
        )
      ),
    },
    {
      title: 'CS Notes',
      key: 'notes',
      width: 200,
      render: (_, record) => (
        <NoteEditor
          productId={productId}
          variantId={record.id}
          csImportantNote={record.csImportantNote}
          csSpecialPoint={record.csSpecialPoint}
          onSave={onSaveNote}
          onDelete={onDeleteNote}
          isLoading={isLoading}
          compact
        />
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={variants}
      rowKey="id"
      pagination={false}
      size="small"
      bordered
      style={{ 
        background: '#fafafa',
        margin: '8px 0',
      }}
    />
  );
};

export default VariantRow;
