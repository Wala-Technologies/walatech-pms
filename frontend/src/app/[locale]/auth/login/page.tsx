'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { apiClient } from '../../../../lib/api-client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const t = useTranslations('common');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiClient.login(email, password);

      if (response.data && !response.error) {
        // Store the token in localStorage with the key the API client expects
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('auth_token', response.data.access_token); // Backup key
        localStorage.setItem('user', JSON.stringify(response.data.user));
        // Redirect to dashboard
        router.push('/en/dashboard');
      } else {
        setError(response.error || 'Login failed');
      }
    } catch (err) {
      setError('Backend server is not running or login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
        {t('login')}
      </h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Enter your password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 px-4 rounded-md font-medium transition-colors"
        >
          {loading ? 'Signing in...' : t('login')}
        </button>
      </form>

      <div className="mt-3 text-center">
        <Link href="/en/auth/forgot-password" className="text-blue-600 hover:text-blue-700 text-sm">
          Forgot password?
        </Link>
      </div>

      <div className="mt-6 text-center">
        <p className="text-gray-600 dark:text-gray-300">
          Don't have an account?{' '}
          <Link href="/en/auth/register" className="text-blue-600 hover:text-blue-700 font-medium">
            {t('register')}
          </Link>
        </p>
      </div>

      <div className="mt-4 text-center">
        <Link href="/en" className="text-gray-500 hover:text-gray-700 text-sm">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}