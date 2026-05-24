export type SupportedLocale = 'ja' | 'en';
export type MessageArgs = string | string[] | undefined;

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

export function formatMessageArgs(
  messageKey: string,
  args: MessageArgs,
  premiumPrice: string,
  locale: SupportedLocale
): MessageArgs {
  if (messageKey === 'buttonBuy' || messageKey === 'buyPremiumAriaLabel') {
    return [premiumPrice];
  }

  if (!args) return undefined;

  if (messageKey === 'trialStatus' || messageKey === 'trialStatusOneDay') {
    const messageArgs = Array.isArray(args) ? args : [args];
    return messageArgs.map(arg => formatLocalizedNumber(Number(arg), locale));
  }

  return args;
}
