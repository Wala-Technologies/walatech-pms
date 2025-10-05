'use client';

import React from 'react';
import { Dropdown, Button, message } from 'antd';
import {
  GlobalOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';

const languages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'am', name: 'Amharic', nativeName: 'አማርኛ' },
  { code: 'ti', name: 'Tigrinya', nativeName: 'ትግርኛ' },
  { code: 'or', name: 'Oromo', nativeName: 'Oromoo' },
] as const;

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();

  const handleLanguageChange = (newLocale: string) => {
    try {
      // Store the language preference in a cookie
      document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
      
      // Replace the locale in the pathname
      const newPathname = pathname.replace(`/${currentLocale}`, `/${newLocale}`);
      
      // Show success message
      const selectedLanguage = languages.find(lang => lang.code === newLocale);
      message.success(`Language changed to ${selectedLanguage?.nativeName || newLocale}`);
      
      // Navigate to new locale
      router.push(newPathname);
    } catch (error) {
      console.error('Error changing language:', error);
      message.error('Failed to change language. Please try again.');
    }
  };

  const getCurrentLanguage = () => {
    return languages.find(lang => lang.code === currentLocale) || languages[0];
  };

  const menuItems = languages.map((language) => ({
    key: language.code,
    label: (
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center space-x-2">
          <span className="text-sm">{language.nativeName}</span>
          <span className="text-xs text-gray-500">({language.name})</span>
        </div>
        {currentLocale === language.code && (
          <CheckOutlined className="text-green-600" />
        )}
      </div>
    ),
    onClick: () => handleLanguageChange(language.code),
  }));

  return (
    <Dropdown
      menu={{
        items: menuItems,
        selectable: true,
        selectedKeys: [currentLocale],
      }}
      trigger={['click']}
      placement="bottomRight"
      arrow
    >
      <Button
        type="text"
        icon={<GlobalOutlined />}
        className="flex items-center space-x-1"
        title={`Current language: ${getCurrentLanguage().nativeName}`}
      >
        <span className="hidden sm:inline">{getCurrentLanguage().nativeName}</span>
      </Button>
    </Dropdown>
  );
}
