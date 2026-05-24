export type SupportedLocale = 'ja' | 'en';
export type MessageArgs = string | string[] | undefined;

export const PREMIUM_PRICE_USD = 3;

const INTL_LOCALES: Record<SupportedLocale, string> = {
  ja: 'ja-JP',
  en: 'en-US'
};

export function getSupportedLocale(uiLanguage: string): SupportedLocale {
  return uiLanguage.toLowerCase().startsWith('en') ? 'en' : 'ja';
}

export function formatLocalizedNumber(value: number, locale: SupportedLocale): string {
  return new Intl.NumberFormat(INTL_LOCALES[locale]).format(value);
}

export function formatUsdPrice(value: number, locale: SupportedLocale): string {
  const formattedNumber = new Intl.NumberFormat(INTL_LOCALES[locale], {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0
  }).format(value);

  return locale === 'ja' ? `US$${formattedNumber}` : `$${formattedNumber}`;
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
