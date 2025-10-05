import React, { Suspense } from 'react';
import ResetPasswordForm from './ResetPasswordForm';
import { Spin } from 'antd';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen"><Spin size="large" /></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
