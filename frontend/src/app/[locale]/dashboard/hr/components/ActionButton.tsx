'use client';

import { Button, Tooltip, Popconfirm } from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined, 
  CheckOutlined, 
  CloseOutlined,
  UserAddOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  DownloadOutlined,
  PrinterOutlined
} from '@ant-design/icons';
import React from 'react';

export type ActionType = 
  | 'edit' 
  | 'delete' 
  | 'view' 
  | 'approve' 
  | 'reject'
  | 'add-employee'
  | 'apply-leave'
  | 'mark-attendance'
  | 'download'
  | 'print';

interface ActionConfig {
  icon: React.ComponentType;
  type: 'default' | 'primary';
  tooltip: string;
  color: string;
  danger?: boolean;
}

interface ActionButtonProps {
  type: ActionType;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  tooltip?: string;
  confirmMessage?: string;
  size?: 'small' | 'middle' | 'large';
  className?: string;
  children?: React.ReactNode;
}

const actionConfig: Record<ActionType, ActionConfig> = {
  edit: { 
    icon: EditOutlined, 
    type: 'default' as const, 
    tooltip: 'Edit',
    color: '#1890ff'
  },
  delete: { 
    icon: DeleteOutlined, 
    type: 'default' as const, 
    tooltip: 'Delete',
    color: '#ff4d4f',
    danger: true
  },
  view: { 
    icon: EyeOutlined, 
    type: 'default' as const, 
    tooltip: 'View Details',
    color: '#52c41a'
  },
  approve: { 
    icon: CheckOutlined, 
    type: 'primary' as const, 
    tooltip: 'Approve',
    color: '#52c41a'
  },
  reject: { 
    icon: CloseOutlined, 
    type: 'default' as const, 
    tooltip: 'Reject',
    color: '#ff4d4f',
    danger: true
  },
  'add-employee': { 
    icon: UserAddOutlined, 
    type: 'primary' as const, 
    tooltip: 'Add Employee',
    color: '#1890ff'
  },
  'apply-leave': { 
    icon: CalendarOutlined, 
    type: 'default' as const, 
    tooltip: 'Apply for Leave',
    color: '#faad14'
  },
  'mark-attendance': { 
    icon: ClockCircleOutlined, 
    type: 'default' as const, 
    tooltip: 'Mark Attendance',
    color: '#722ed1'
  },
  download: { 
    icon: DownloadOutlined, 
    type: 'default' as const, 
    tooltip: 'Download',
    color: '#1890ff'
  },
  print: { 
    icon: PrinterOutlined, 
    type: 'default' as const, 
    tooltip: 'Print',
    color: '#1890ff'
  },
};

export const ActionButton: React.FC<ActionButtonProps> = ({
  type,
  onClick,
  loading = false,
  disabled = false,
  tooltip,
  confirmMessage,
  size = 'middle',
  className,
  children,
}) => {
  const config = actionConfig[type];
  const IconComponent = config.icon;
  const displayTooltip = tooltip || config.tooltip;

  const button = (
    <Button
      type={config.type}
      icon={<IconComponent />}
      onClick={onClick}
      loading={loading}
      disabled={disabled}
      size={size}
      className={className}
      danger={config.danger || false}
      style={config.color ? { borderColor: config.color, color: config.color } : undefined}
    >
      {children}
    </Button>
  );

  const wrappedButton = confirmMessage ? (
    <Popconfirm
      title={confirmMessage}
      onConfirm={onClick}
      okText="Yes"
      cancelText="No"
      disabled={disabled || loading}
    >
      <Button
        type={config.type}
        icon={<IconComponent />}
        loading={loading}
        disabled={disabled}
        size={size}
        className={className}
        danger={config.danger}
        style={config.color ? { borderColor: config.color, color: config.color } : undefined}
      >
        {children}
      </Button>
    </Popconfirm>
  ) : button;

  return displayTooltip ? (
    <Tooltip title={displayTooltip}>
      {wrappedButton}
    </Tooltip>
  ) : wrappedButton;
};

export default ActionButton;