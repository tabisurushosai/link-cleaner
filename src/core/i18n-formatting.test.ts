import { describe, expect, it } from 'vitest';
import {
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
    expect(formatUsdPrice(PREMIUM_PRICE_USD, 'ja')).toBe('$3');
  });
});
