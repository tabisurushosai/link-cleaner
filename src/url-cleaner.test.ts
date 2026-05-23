import { describe, it, expect } from 'vitest';
import { cleanUrl } from './url-cleaner';

describe('cleanUrl', () => {
  it('should remove utm parameters', () => {
    const input = 'https://example.com/page?utm_source=google&utm_medium=cpc&utm_campaign=summer_sale&q=search';
    const expected = 'https://example.com/page?q=search';
    expect(cleanUrl(input)).toBe(expected);
  });

  it('should remove fbclid and gclid', () => {
    const input = 'https://example.com/page?fbclid=123&gclid=456&important=true';
    const expected = 'https://example.com/page?important=true';
    expect(cleanUrl(input)).toBe(expected);
  });

  it('should remove ref parameter', () => {
    const input = 'https://example.com/page?ref=bookmarks';
    const expected = 'https://example.com/page';
    expect(cleanUrl(input)).toBe(expected);
  });

  it('should handle URLs without tracking parameters', () => {
    const input = 'https://example.com/page?q=search';
    const expected = 'https://example.com/page?q=search';
    expect(cleanUrl(input)).toBe(expected);
  });

  it('should handle URLs without any parameters', () => {
    const input = 'https://example.com/page';
    const expected = 'https://example.com/page';
    expect(cleanUrl(input)).toBe(expected);
  });

  it('should return original string if URL is invalid', () => {
    const input = 'not-a-url';
    expect(cleanUrl(input)).toBe(input);
  });
});
