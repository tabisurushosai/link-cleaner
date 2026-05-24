import { describe, expect, it } from 'vitest';
import {
  formatMessageArgs,
  formatLocalizedNumber,
  formatUsdPrice,
  getSupportedLocale,
  PREMIUM_PRICE_USD
} from './i18n-formatting';

describe('i18n formatting', () => {
  it('keeps supported locales limited to Japanese and English', () => {
    expect(getSupportedLocale('en-US')).toBe('en');
    expect(getSupportedLocale('ja-JP')).toBe('ja');
    expect(getSupportedLocale('fr-FR')).toBe('ja');
  });

  it('formats counts with the selected locale', () => {
    expect(formatLocalizedNumber(1234, 'en')).toBe('1,234');
    expect(formatLocalizedNumber(1234, 'ja')).toBe('1,234');
  });

  it('formats the one-time Premium price without fractional digits', () => {
    expect(formatUsdPrice(PREMIUM_PRICE_USD, 'en')).toBe('$3');
    expect(formatUsdPrice(PREMIUM_PRICE_USD, 'ja')).toBe('US$3');
  });

  it('injects the localized Premium price into purchase messages', () => {
    expect(formatMessageArgs('buttonBuy', undefined, '$3', 'en')).toEqual(['$3']);
    expect(formatMessageArgs('buyPremiumAriaLabel', undefined, 'US$3', 'ja')).toEqual(['US$3']);
  });

  it('localizes trial day counts while leaving other message args unchanged', () => {
    expect(formatMessageArgs('trialStatus', ['1234'], '$3', 'en')).toEqual(['1,234']);
    expect(formatMessageArgs('trialStatusOneDay', '1', 'US$3', 'ja')).toEqual(['1']);
    expect(formatMessageArgs('statusRuleAdded', 'ref', '$3', 'en')).toBe('ref');
  });
});
