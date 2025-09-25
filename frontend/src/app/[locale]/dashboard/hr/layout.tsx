'use client';

interface HRLayoutProps {
  children: React.ReactNode;
}

export default function HRLayout({ children }: HRLayoutProps) {

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: 'calc(100vh - 64px)' }}>
      {children}
    </div>
  );
}