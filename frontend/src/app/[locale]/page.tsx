import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function HomePage() {
  const t = useTranslations('common');
  const tNav = useTranslations('navigation');
  const tEth = useTranslations('ethiopian');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            WalaTech PMS
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Production Management System for Ethiopian Manufacturing
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              href="/en/auth/login"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              {t('login')}
            </Link>
            <Link
              href="/en/auth/register"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              {t('register')}
            </Link>
          </div>
        </header>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
              {tNav('manufacturing')}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Complete manufacturing workflow management with work orders, BOMs, and quality control.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
              {tNav('inventory')}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Real-time inventory tracking and management with automated stock alerts.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
              {tNav('reports')}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Comprehensive reporting and analytics for production insights.
            </p>
          </div>
        </div>

        {/* Ethiopian Localization Features */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            Ethiopian Localization
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Multi-Language Support
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li>• {tEth('languages.english')}</li>
                <li>• {tEth('languages.amharic')}</li>
                <li>• {tEth('languages.tigrinya')}</li>
                <li>• {tEth('languages.oromo')}</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Local Standards
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li>• {tEth('calendar')}</li>
                <li>• {tEth('timezone')}</li>
                <li>• {tEth('currency')}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Language Switcher */}
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Choose Your Language
          </h3>
          <div className="flex justify-center space-x-4">
            <Link
              href="/en"
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              English
            </Link>
            <Link
              href="/am"
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              አማርኛ
            </Link>
            <Link
              href="/ti"
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              ትግርኛ
            </Link>
            <Link
              href="/or"
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Afaan Oromoo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}