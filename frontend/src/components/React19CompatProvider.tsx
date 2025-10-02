'use client';

import { useEffect, ReactNode } from 'react';
import { configureAntdForReact19 } from '../lib/react19-compat';

interface React19CompatProviderProps {
  children: ReactNode;
}

export function React19CompatProvider({ children }: React19CompatProviderProps) {
  useEffect(() => {
    // Configure Ant Design for React 19 compatibility on client side
    configureAntdForReact19();
  }, []);

  return <>{children}</>;
}