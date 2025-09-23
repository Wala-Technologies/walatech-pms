'use client';

import { Card, Row, Col, Statistic, Button, Space, Typography } from 'antd';
import {
  DollarOutlined,
  BankOutlined,
  FileTextOutlined,
  BarChartOutlined,
  PlusOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { use } from 'react';

const { Title, Text } = Typography;

interface AccountingPageProps {
  params: Promise<{ locale: string }>;
}

export default function AccountingPage({ params }: AccountingPageProps) {
  const { locale } = use(params);
  const t = useTranslations('accounting');

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Accounting Overview</Title>
        <Text type="secondary">
          Manage your financial records, journal entries, and generate reports
        </Text>
      </div>

      {/* Key Metrics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Assets"
              value={0}
              precision={2}
              valueStyle={{ color: '#3f8600' }}
              prefix={<DollarOutlined />}
              suffix="USD"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Liabilities"
              value={0}
              precision={2}
              valueStyle={{ color: '#cf1322' }}
              prefix={<DollarOutlined />}
              suffix="USD"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Equity"
              value={0}
              precision={2}
              valueStyle={{ color: '#1890ff' }}
              prefix={<DollarOutlined />}
              suffix="USD"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Journal Entries"
              value={0}
              valueStyle={{ color: '#722ed1' }}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title="Quick Actions"
            extra={
              <Space>
                <Link href={`/${locale}/dashboard/accounting/journal-entries`}>
                  <Button type="primary" icon={<PlusOutlined />}>
                    New Journal Entry
                  </Button>
                </Link>
              </Space>
            }
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Link href={`/${locale}/dashboard/accounting/chart-of-accounts`}>
                <Button
                  type="text"
                  icon={<BankOutlined />}
                  style={{ textAlign: 'left', width: '100%' }}
                >
                  Manage Chart of Accounts
                </Button>
              </Link>
              <Link href={`/${locale}/dashboard/accounting/general-ledger`}>
                <Button
                  type="text"
                  icon={<EyeOutlined />}
                  style={{ textAlign: 'left', width: '100%' }}
                >
                  View General Ledger
                </Button>
              </Link>
              <Link href={`/${locale}/dashboard/accounting/reports/trial-balance`}>
                <Button
                  type="text"
                  icon={<BarChartOutlined />}
                  style={{ textAlign: 'left', width: '100%' }}
                >
                  Generate Trial Balance
                </Button>
              </Link>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Recent Activity">
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Text type="secondary">No recent activity</Text>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}