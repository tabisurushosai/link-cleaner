export type SupportedLocale = 'ja' | 'en';

export const PREMIUM_PRICE_USD = 3;

export function getSupportedLocale(uiLanguage: string): SupportedLocale {
  return uiLanguage.toLowerCase().startsWith('en') ? 'en' : 'ja';
}

export function formatLocalizedNumber(value: number, locale: SupportedLocale): string {
  return new Intl.NumberFormat(locale).format(value);
}

export function formatUsdPrice(value: number, locale: SupportedLocale): string {
  const formatterLocale = locale === 'ja' ? 'ja-JP' : 'en-US';

  return new Intl.NumberFormat(formatterLocale, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value);
}
