import "@ant-design/v5-patch-for-react-19";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { locales } from '../../i18n';
import { TenantProvider } from '../../contexts/tenant-context';
import { React19CompatProvider } from '../../components/React19CompatProvider';
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WalaTech PMS",
  description: "Production Management System for Ethiopian Manufacturing",
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({
  children,
  params
}: Props) {
  const { locale } = await params;
  
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as typeof locales[number])) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <AntdRegistry>
          <NextIntlClientProvider messages={messages}>
            <TenantProvider>
              <React19CompatProvider>
                {children}
              </React19CompatProvider>
            </TenantProvider>
          </NextIntlClientProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}