import { cleanUrl } from './url-cleaner';
import { SubscriptionStatus, canUseCustomParams } from './subscription';

export interface UrlViewModel {
  originalText: string;
  cleanedText: string;
  cleanedUrl: string;
  canCopy: boolean;
}

export type SubscriptionMessageKey = 'premiumStatus' | 'trialStatus' | 'freeStatus';

export interface SubscriptionViewModel {
  messageKey: SubscriptionMessageKey;
  messageArgs?: string[];
  showBuyButton: boolean;
  canEditCustomParams: boolean;
}

export function createUrlViewModel(
  currentUrl: string | undefined,
  params: string[],
  notFoundText: string
): UrlViewModel {
  if (!currentUrl) {
    return {
      originalText: notFoundText,
      cleanedText: notFoundText,
      cleanedUrl: '',
      canCopy: false
    };
  }

  const cleanedUrl = cleanUrl(currentUrl, params);
  return {
    originalText: currentUrl,
    cleanedText: cleanedUrl,
    cleanedUrl,
    canCopy: true
  };
}

export function createSubscriptionViewModel(status: SubscriptionStatus): SubscriptionViewModel {
  const canEditCustomParams = canUseCustomParams(status);

  if (status.isPremium) {
    return {
      messageKey: 'premiumStatus',
      showBuyButton: false,
      canEditCustomParams
    };
  }

  if (status.isTrialActive) {
    return {
      messageKey: 'trialStatus',
      messageArgs: [status.trialDaysLeft.toString()],
      showBuyButton: true,
      canEditCustomParams
    };
  }

  return {
    messageKey: 'freeStatus',
    showBuyButton: true,
    canEditCustomParams
  };
}
