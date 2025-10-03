'use client';

import { useState } from 'react';
import { Form, Input, Button, Alert, Typography } from 'antd';
import Link from 'next/link';
import { apiClient } from '../../../../lib/api-client';

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [debugToken, setDebugToken] = useState<string | null>(null);

  const onFinish = async (values: { email: string }) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    setDebugToken(null);
    const { email } = values;

    const res = await apiClient.forgotPassword(email);
    setLoading(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    setSuccess('If the email exists, a reset link has been sent.');
    if (res.data?.reset_token) {
      setDebugToken(res.data.reset_token);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <Typography.Title level={3}>Forgot Password</Typography.Title>
      <Typography.Paragraph>
        Enter your account email and we will send you a link to reset your password.
      </Typography.Paragraph>

      {error && <Alert type="error" message={error} className="mb-4" />}
      {success && <Alert type="success" message={success} className="mb-4" />}

      <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
        <Form.Item
          name="email"
          label="Email"
          rules={[{ required: true, message: 'Please enter your email' }, { type: 'email', message: 'Enter a valid email' }]}
        >
          <Input placeholder="you@example.com" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Send reset link
          </Button>
        </Form.Item>
      </Form>

      {debugToken && (
        <div className="mt-4">
          <Alert
            type="info"
            message="Debug: Reset token (use this to test reset page)"
            description={
              <div className="break-all">
                <code>{debugToken}</code>
                <div className="mt-2">
                  Use this link: <code>{`/en/auth/reset-password?token=${encodeURIComponent(debugToken)}`}</code>
                </div>
              </div>
            }
            showIcon
          />
        </div>
      )}

      <div className="mt-6">
        <Link href="/en/auth/login">Back to login</Link>
      </div>
    </div>
  );
}
