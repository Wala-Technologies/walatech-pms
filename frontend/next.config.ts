import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';
import path from 'path';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, '../'),
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default withNextIntl(nextConfig);
