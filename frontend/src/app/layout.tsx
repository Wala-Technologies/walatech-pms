// This page only renders when `next.config.js` is missing the `i18n` config.
// It will redirect to the default locale.
// When using internationalization, the HTML structure is handled by the locale layout.

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "WalaTech PMS",
  description: "Production Management System for Ethiopian Manufacturing",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
