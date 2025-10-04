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
    if (!logoUrl) return '';
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
      
      // Use the tenant ID in the URL path as expected by backend
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
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
      <div style={{ 
        width: '120px', 
        height: '120px', 
        border: '2px dashed #d9d9d9',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fafafa',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {previewUrl ? (
          <img
            src={getAbsoluteLogoUrl(previewUrl)}
            alt="Organization Logo"
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              borderRadius: '6px'
            }}
            onError={(e) => {
              console.warn('Logo failed to load:', previewUrl);
              // Hide the broken image instead of showing error
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div style={{
            color: '#999',
            fontSize: '14px',
            textAlign: 'center',
            padding: '8px'
          }}>
            No Logo
            <br />
            <small>Upload an image</small>
          </div>
        )}
      </div>
      
      <Space direction="vertical" style={{ flex: 1 }}>
        <Upload {...uploadProps}>
          <Button 
            icon={<UploadOutlined />} 
            loading={uploading}
            disabled={uploading}
            type="primary"
            ghost
          >
            {uploading ? 'Uploading...' : 'Choose Logo'}
          </Button>
        </Upload>
        
        {previewUrl && (
          <Button 
            icon={<DeleteOutlined />} 
            onClick={handleRemove}
            danger
            type="text"
            size="small"
          >
            Remove Logo
          </Button>
        )}
        
        <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.4' }}>
          <strong>Recommended:</strong> 200x200px or larger
          <br />
          <strong>Formats:</strong> PNG, JPG, SVG (max 5MB)
          <br />
          <strong>Best results:</strong> Square images with transparent background
        </div>
      </Space>
    </div>
  );
}