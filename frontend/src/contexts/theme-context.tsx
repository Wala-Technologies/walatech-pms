'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ConfigProvider, theme } from 'antd';
import { useTenant } from './tenant-context';

interface ThemeSettings {
  primaryColor: string;
  secondaryColor: string;
  logoPosition: 'left' | 'center';
  sidebarStyle: 'light' | 'dark';
  headerStyle: 'light' | 'dark';
}

interface ThemeContextType {
  themeSettings: ThemeSettings;
  updateTheme: (settings: Partial<ThemeSettings>) => void;
  applyTheme: () => void;
}

const defaultTheme: ThemeSettings = {
  primaryColor: '#1890ff',
  secondaryColor: '#52c41a',
  logoPosition: 'left',
  sidebarStyle: 'light',
  headerStyle: 'light',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(defaultTheme);
  const { tenant } = useTenant();

  const updateTheme = (settings: Partial<ThemeSettings>) => {
    setThemeSettings(prev => ({ ...prev, ...settings }));
  };

  const applyTheme = () => {
    // Apply CSS custom properties for dynamic theming
    const root = document.documentElement;
    root.style.setProperty('--primary-color', themeSettings.primaryColor);
    root.style.setProperty('--secondary-color', themeSettings.secondaryColor);
    root.style.setProperty('--sidebar-bg', themeSettings.sidebarStyle === 'dark' ? '#001529' : '#ffffff');
    root.style.setProperty('--sidebar-text', themeSettings.sidebarStyle === 'dark' ? '#ffffff' : '#000000');
    root.style.setProperty('--header-bg', themeSettings.headerStyle === 'dark' ? '#001529' : '#ffffff');
    root.style.setProperty('--header-text', themeSettings.headerStyle === 'dark' ? '#ffffff' : '#000000');
  };

  // Load theme from tenant settings
  useEffect(() => {
    if (tenant?.settings) {
      const { branding, theme: themeSettings } = tenant.settings;
      setThemeSettings({
        primaryColor: themeSettings?.primaryColor || branding?.primaryColor || defaultTheme.primaryColor,
        secondaryColor: themeSettings?.secondaryColor || branding?.secondaryColor || defaultTheme.secondaryColor,
        logoPosition: themeSettings?.logoPosition || defaultTheme.logoPosition,
        sidebarStyle: themeSettings?.sidebarStyle || defaultTheme.sidebarStyle,
        headerStyle: themeSettings?.headerStyle || defaultTheme.headerStyle,
      });
    }
  }, [tenant]);

  // Apply theme whenever settings change
  useEffect(() => {
    applyTheme();
  }, [themeSettings]);

  const antdTheme = {
    token: {
      colorPrimary: themeSettings.primaryColor,
      colorSuccess: themeSettings.secondaryColor,
    },
    algorithm: theme.defaultAlgorithm,
  };

  return (
    <ThemeContext.Provider value={{ themeSettings, updateTheme, applyTheme }}>
      <ConfigProvider theme={antdTheme}>
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};