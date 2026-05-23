import { describe, expect, it } from 'vitest';
import { createSubscriptionViewModel, createUrlViewModel } from './popup-view-model';

describe('popup view model', () => {
  it('creates display values for a cleanable URL', () => {
    const viewModel = createUrlViewModel(
      'https://example.com/page?utm_source=newsletter&q=keep',
      ['utm_source'],
      'URL not found'
    );

    expect(viewModel).toEqual({
      originalText: 'https://example.com/page?utm_source=newsletter&q=keep',
      cleanedText: 'https://example.com/page?q=keep',
      cleanedUrl: 'https://example.com/page?q=keep',
      canCopy: true
    });
  });

  it('keeps subscription UI decisions platform independent', () => {
    const viewModel = createSubscriptionViewModel({
      isPremium: false,
      isTrialActive: false,
      trialDaysLeft: 0
    });

    expect(viewModel).toEqual({
      messageKey: 'freeStatus',
      showBuyButton: true,
      canEditCustomParams: false
    });
  });

  it('uses a singular trial message key for one day left', () => {
    const viewModel = createSubscriptionViewModel({
      isPremium: false,
      isTrialActive: true,
      trialDaysLeft: 1
    });

    expect(viewModel).toEqual({
      messageKey: 'trialStatusOneDay',
      messageArgs: ['1'],
      showBuyButton: true,
      canEditCustomParams: true
    });
  });
});
