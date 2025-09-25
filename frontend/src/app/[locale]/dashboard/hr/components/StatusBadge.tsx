'use client';

import { Tag } from 'antd';
import React from 'react';

export type StatusType = 
  | 'employee-active' 
  | 'employee-inactive' 
  | 'employee-terminated'
  | 'leave-pending' 
  | 'leave-approved' 
  | 'leave-rejected'
  | 'attendance-present' 
  | 'attendance-absent' 
  | 'attendance-late' 
  | 'attendance-half-day'
  | 'department-active'
  | 'department-inactive';

interface StatusBadgeProps {
  status: string;
  type: StatusType;
  className?: string;
}

const statusConfig = {
  'employee-active': { color: 'green', text: 'Active' },
  'employee-inactive': { color: 'orange', text: 'Inactive' },
  'employee-terminated': { color: 'red', text: 'Terminated' },
  'leave-pending': { color: 'orange', text: 'Pending' },
  'leave-approved': { color: 'green', text: 'Approved' },
  'leave-rejected': { color: 'red', text: 'Rejected' },
  'attendance-present': { color: 'green', text: 'Present' },
  'attendance-absent': { color: 'red', text: 'Absent' },
  'attendance-late': { color: 'orange', text: 'Late' },
  'attendance-half-day': { color: 'blue', text: 'Half Day' },
  'department-active': { color: 'green', text: 'Active' },
  'department-inactive': { color: 'red', text: 'Inactive' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type, className }) => {
  const config = statusConfig[type];
  const displayText = status || config.text;

  return (
    <Tag color={config.color} className={className}>
      {displayText}
    </Tag>
  );
};

export default StatusBadge;