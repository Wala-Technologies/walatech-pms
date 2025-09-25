'use client';

import { Modal, Form, Button, Space } from 'antd';
import React from 'react';
import type { FormInstance } from 'antd/es/form';

interface FormModalProps {
  title: string;
  open: boolean;
  onCancel: () => void;
  onOk?: () => void;
  form?: FormInstance;
  children: React.ReactNode;
  loading?: boolean;
  width?: number;
  okText?: string;
  cancelText?: string;
  destroyOnClose?: boolean;
  maskClosable?: boolean;
  footer?: React.ReactNode | null;
  className?: string;
}

export const FormModal: React.FC<FormModalProps> = ({
  title,
  open,
  onCancel,
  onOk,
  form,
  children,
  loading = false,
  width = 600,
  okText = 'Save',
  cancelText = 'Cancel',
  destroyOnClose = true,
  maskClosable = false,
  footer,
  className,
}) => {
  const handleOk = () => {
    if (form) {
      form.submit();
    } else {
      onOk?.();
    }
  };

  const defaultFooter = (
    <Space>
      <Button onClick={onCancel} disabled={loading}>
        {cancelText}
      </Button>
      <Button 
        type="primary" 
        onClick={handleOk} 
        loading={loading}
      >
        {okText}
      </Button>
    </Space>
  );

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onCancel}
      width={width}
      destroyOnClose={destroyOnClose}
      maskClosable={maskClosable}
      footer={footer !== undefined ? footer : defaultFooter}
      className={className}
    >
      {children}
    </Modal>
  );
};

export default FormModal;