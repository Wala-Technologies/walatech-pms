'use client';

interface SuppliersLayoutProps {
  children: React.ReactNode;
}

export default function SuppliersLayout({ children }: SuppliersLayoutProps) {
  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: 'calc(100vh - 64px)' }}>
      {children}
    </div>
  );
}