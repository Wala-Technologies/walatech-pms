// This page only renders when `next.config.js` is missing the `i18n` config.
// It will redirect to the default locale.
// When using internationalization, the HTML structure is handled by the locale layout.

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        {children}
      </body>
    </html>
  );
}
