import { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                WalaTech PMS
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Production Management System
              </p>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}