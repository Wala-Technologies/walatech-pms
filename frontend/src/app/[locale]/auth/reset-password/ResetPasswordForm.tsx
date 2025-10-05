'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Form, Input, Button, Alert, Typography } from 'antd';
import Link from 'next/link';
import { apiClient } from '../../../../lib/api-client';

export default function ResetPasswordForm() {
  const params = useSearchParams();
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const t = params.get('token');
    setToken(t);
  }, [params]);

  const onFinish = async (values: { password: string; confirm: string }) => {
    if (!token) {
      setError('Missing or invalid token. Please use the link from your email.');
      return;
    }
    if (values.password !== values.confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError(null);

    const res = await apiClient.resetPassword(token, values.password);
    setLoading(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    setSuccess('Your password has been reset. Redirecting to login...');
    setTimeout(() => {
      router.replace('/en/auth/login');
    }, 1500);
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <Typography.Title level={3}>Reset Password</Typography.Title>
      <Typography.Paragraph>
        Enter your new password below.
      </Typography.Paragraph>

      {!token && (
        <Alert type="warning" message="No token provided" className="mb-4" />
      )}
      {error && <Alert type="error" message={error} className="mb-4" />}
      {success && <Alert type="success" message={success} className="mb-4" />}

      <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
        <Form.Item
          name="password"
          label="New Password"
          rules={[{ required: true, message: 'Please enter a new password' }, { min: 6, message: 'Minimum 6 characters' }]}
        >
          <Input.Password placeholder="Enter new password" />
        </Form.Item>
        <Form.Item
          name="confirm"
          label="Confirm Password"
          dependencies={["password"]}
          rules={[{ required: true, message: 'Please confirm your password' }]}
        >
          <Input.Password placeholder="Re-enter new password" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block disabled={!token}>
            Reset Password
          </Button>
        </Form.Item>
      </Form>

      <div className="mt-6">
        <Link href="/en/auth/login">Back to login</Link>
      </div>
    </div>
  );
}