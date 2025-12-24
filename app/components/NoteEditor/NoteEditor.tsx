'use client';

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Input, 
  Button, 
  Space, 
  Typography, 
  Popconfirm,
  Spin,
  message
} from 'antd';
import { 
  SaveOutlined, 
  DeleteOutlined, 
  EditOutlined,
  CloseOutlined
} from '@ant-design/icons';

const { TextArea } = Input;
const { Text } = Typography;

interface NoteEditorProps {
  productId: string;
  variantId?: string;
  csImportantNote?: string;
  csSpecialPoint?: string;
  onSave: (data: {
    productId: string;
    variantId?: string;
    csImportantNote?: string;
    csSpecialPoint?: string;
  }) => void;
  onDelete: (productId: string, variantId?: string) => void;
  isLoading?: boolean;
  compact?: boolean;
}

const NoteEditor: React.FC<NoteEditorProps> = ({
  productId,
  variantId,
  csImportantNote = '',
  csSpecialPoint = '',
  onSave,
  onDelete,
  isLoading = false,
  compact = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [importantNote, setImportantNote] = useState(csImportantNote);
  const [specialPoint, setSpecialPoint] = useState(csSpecialPoint);

  // Sync with props when they change
  useEffect(() => {
    setImportantNote(csImportantNote);
    setSpecialPoint(csSpecialPoint);
  }, [csImportantNote, csSpecialPoint]);

  const hasNotes = csImportantNote || csSpecialPoint;
  const hasChanges = importantNote !== csImportantNote || specialPoint !== csSpecialPoint;

  const handleSave = () => {
    if (!hasChanges) {
      message.info('No changes to save');
      return;
    }
    
    onSave({
      productId,
      variantId,
      csImportantNote: importantNote || undefined,
      csSpecialPoint: specialPoint || undefined,
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    onDelete(productId, variantId);
    setImportantNote('');
    setSpecialPoint('');
    setIsEditing(false);
  };

  const handleCancel = () => {
    setImportantNote(csImportantNote);
    setSpecialPoint(csSpecialPoint);
    setIsEditing(false);
  };

  if (isLoading) {
    return <Spin size="small" />;
  }

  // Compact view (for variant rows)
  if (compact && !isEditing) {
    return (
      <Space size="small" align="start">
        {hasNotes ? (
          <>
            <div style={{ maxWidth: 200 }}>
              {csImportantNote && (
                <Text type="secondary" ellipsis style={{ display: 'block', fontSize: 12 }}>
                  <strong>Note:</strong> {csImportantNote}
                </Text>
              )}
              {csSpecialPoint && (
                <Text type="secondary" ellipsis style={{ display: 'block', fontSize: 12 }}>
                  <strong>Special:</strong> {csSpecialPoint}
                </Text>
              )}
            </div>
            <Button 
              size="small" 
              icon={<EditOutlined />} 
              onClick={() => setIsEditing(true)}
            />
          </>
        ) : (
          <Button 
            size="small" 
            type="dashed" 
            icon={<EditOutlined />}
            onClick={() => setIsEditing(true)}
          >
            Add Note
          </Button>
        )}
      </Space>
    );
  }

  // Non-editing view
  if (!isEditing) {
    return (
      <Card 
        size="small" 
        style={{ marginTop: 8 }}
        title={
          <Space>
            <Text strong>CS Notes</Text>
            {hasNotes && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                ({[csImportantNote && 'Important', csSpecialPoint && 'Special'].filter(Boolean).join(', ')})
              </Text>
            )}
          </Space>
        }
        extra={
          <Button 
            type="primary" 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => setIsEditing(true)}
          >
            {hasNotes ? 'Edit' : 'Add Notes'}
          </Button>
        }
      >
        {hasNotes ? (
          <Space direction="vertical" style={{ width: '100%' }}>
            {csImportantNote && (
              <div>
                <Text strong style={{ color: '#ff4d4f' }}>Important Note:</Text>
                <div style={{ 
                  background: '#fff2f0', 
                  padding: 8, 
                  borderRadius: 4,
                  marginTop: 4 
                }}>
                  {csImportantNote}
                </div>
              </div>
            )}
            {csSpecialPoint && (
              <div>
                <Text strong style={{ color: '#1890ff' }}>Special Point:</Text>
                <div style={{ 
                  background: '#e6f7ff', 
                  padding: 8, 
                  borderRadius: 4,
                  marginTop: 4 
                }}>
                  {csSpecialPoint}
                </div>
              </div>
            )}
          </Space>
        ) : (
          <Text type="secondary">No notes available. Click &quot;Add Notes&quot; to create.</Text>
        )}
      </Card>
    );
  }

  // Editing view
  return (
    <Card 
      size="small" 
      style={{ marginTop: 8 }}
      title={<Text strong>Edit CS Notes</Text>}
      extra={
        <Button 
          size="small" 
          icon={<CloseOutlined />}
          onClick={handleCancel}
        >
          Cancel
        </Button>
      }
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <div>
          <Text strong style={{ color: '#ff4d4f' }}>Important Note:</Text>
          <TextArea
            value={importantNote}
            onChange={(e) => setImportantNote(e.target.value)}
            placeholder="Enter important note for CS team..."
            rows={3}
            style={{ marginTop: 4 }}
          />
        </div>
        
        <div>
          <Text strong style={{ color: '#1890ff' }}>Special Point:</Text>
          <TextArea
            value={specialPoint}
            onChange={(e) => setSpecialPoint(e.target.value)}
            placeholder="Enter special points..."
            rows={3}
            style={{ marginTop: 4 }}
          />
        </div>

        <Space>
          <Popconfirm
            title="Save Notes"
            description="Are you sure you want to save these notes?"
            onConfirm={handleSave}
            okText="Save"
            cancelText="Cancel"
            disabled={!hasChanges}
          >
            <Button 
              type="primary" 
              icon={<SaveOutlined />}
              disabled={!hasChanges}
              loading={isLoading}
            >
              Save
            </Button>
          </Popconfirm>

          {hasNotes && (
            <Popconfirm
              title="Delete Notes"
              description="Are you sure you want to delete all notes? This cannot be undone!"
              onConfirm={handleDelete}
              okText="Delete"
              okType="danger"
              cancelText="Cancel"
            >
              <Button 
                danger 
                icon={<DeleteOutlined />}
                loading={isLoading}
              >
                Delete All
              </Button>
            </Popconfirm>
          )}
        </Space>
      </Space>
    </Card>
  );
};

export default NoteEditor;
