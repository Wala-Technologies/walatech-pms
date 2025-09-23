import {getRequestConfig} from 'next-intl/server';

// Can be imported from a shared config
const locales = ['en', 'am', 'ti', 'or'] as const;

export default getRequestConfig(async ({locale}) => {
  // Validate that the incoming `locale` parameter is valid
  const validLocale = locale && locales.includes(locale as typeof locales[number]) ? locale : 'en';

  return {
    locale: validLocale,
    messages: (await import(`../messages/${validLocale}.json`)).default
  };
});

export {locales};