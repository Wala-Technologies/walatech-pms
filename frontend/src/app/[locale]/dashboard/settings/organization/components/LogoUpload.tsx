'use client';

import { useState, useEffect } from 'react';
import { Upload, Avatar, Button, message, Space } from 'antd';
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import { apiClient } from '../../../../../../lib/api-client';
import type { UploadFile, UploadProps } from 'antd';

interface LogoUploadProps {
  value?: string;
  onChange?: (logoUrl: string | null) => void;
  tenant_id?: string;
}

export default function LogoUpload({ value, onChange, tenant_id }: LogoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);

  // Helper function to convert relative logo URLs to absolute URLs
  const getAbsoluteLogoUrl = (logoUrl: string | null) => {
    if (!logoUrl) return null;
    if (logoUrl.startsWith('http')) return logoUrl; // Already absolute
    // For relative URLs starting with /api, prepend the backend server URL
    if (logoUrl.startsWith('/api')) {
      return `http://localhost:3001${logoUrl}`;
    }
    return logoUrl;
  };

  // Update preview when value prop changes (e.g., when form loads existing data)
  useEffect(() => {
    setPreviewUrl(value || null);
  }, [value]);

  const handleUpload = async (file: File) => {
    if (!tenant_id) {
      message.error('No organization selected');
      return false;
    }

    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('logo', file);
      
      const response = await apiClient.post(`/tenants/${tenant_id}/logo`, formData);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      const logoUrl = response.data?.logoUrl;
      if (logoUrl) {
        setPreviewUrl(logoUrl);
        onChange?.(logoUrl);
        message.success('Logo uploaded successfully');
      } else {
        throw new Error('No logo URL returned from server');
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to upload logo');
      console.error('Logo upload error:', error);
    } finally {
      setUploading(false);
    }
    
    return false; // Prevent default upload behavior
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onChange?.(null);
    message.success('Logo removed');
  };

  const uploadProps: UploadProps = {
    beforeUpload: handleUpload,
    showUploadList: false,
    accept: 'image/*',
    maxCount: 1,
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <Avatar
        size={80}
        src={getAbsoluteLogoUrl(previewUrl)}
        style={{
          backgroundColor: '#f0f0f0',
          border: '2px dashed #d9d9d9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {!previewUrl && 'Logo'}
      </Avatar>
      
      <Space direction="vertical">
        <Upload {...uploadProps}>
          <Button 
            icon={<UploadOutlined />} 
            loading={uploading}
            disabled={!tenant_id}
          >
            {uploading ? 'Uploading...' : 'Upload Logo'}
          </Button>
        </Upload>
        
        {previewUrl && (
          <Button 
            icon={<DeleteOutlined />} 
            onClick={handleRemove}
            size="small"
            type="text"
            danger
          >
            Remove
          </Button>
        )}
        
        <div style={{ fontSize: '12px', color: '#666' }}>
          Recommended: 200x200px, max 5MB
          <br />
          Formats: JPG, PNG, GIF, SVG
        </div>
      </Space>
    </div>
  );
}