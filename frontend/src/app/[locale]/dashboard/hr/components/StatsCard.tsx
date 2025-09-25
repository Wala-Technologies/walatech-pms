'use client';

import { Card, Statistic, Avatar } from 'antd';
import { 
  UserOutlined, 
  TeamOutlined, 
  CalendarOutlined, 
  ClockCircleOutlined,
  TrophyOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import React from 'react';

export type StatsCardType = 
  | 'employees' 
  | 'departments' 
  | 'leave-applications' 
  | 'attendance'
  | 'performance'
  | 'alerts';

interface StatsCardProps {
  title: string;
  value: number | string;
  type: StatsCardType;
  suffix?: string;
  prefix?: string;
  loading?: boolean;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  onClick?: () => void;
}

const iconConfig = {
  employees: { icon: UserOutlined, color: '#1890ff' },
  departments: { icon: TeamOutlined, color: '#52c41a' },
  'leave-applications': { icon: CalendarOutlined, color: '#faad14' },
  attendance: { icon: ClockCircleOutlined, color: '#722ed1' },
  performance: { icon: TrophyOutlined, color: '#eb2f96' },
  alerts: { icon: ExclamationCircleOutlined, color: '#f5222d' },
};

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  type,
  suffix,
  prefix,
  loading = false,
  trend,
  className,
  onClick,
}) => {
  const config = iconConfig[type];
  const IconComponent = config.icon;

  return (
    <Card 
      className={`${className} ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={onClick}
      loading={loading}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <Statistic
            title={title}
            value={value}
            suffix={suffix}
            prefix={prefix}
            valueStyle={{ 
              fontSize: '24px', 
              fontWeight: 'bold',
              color: config.color 
            }}
          />
          {trend && (
            <div className={`text-sm mt-1 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}%
              <span className="text-gray-500 ml-1">vs last period</span>
            </div>
          )}
        </div>
        <Avatar 
          size={48} 
          style={{ 
            backgroundColor: config.color + '20',
            color: config.color 
          }}
          icon={<IconComponent />}
        />
      </div>
    </Card>
  );
};

export default StatsCard;