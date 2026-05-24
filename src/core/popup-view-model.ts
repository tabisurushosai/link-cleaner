import { cleanUrl } from './url-cleaner';
import { SubscriptionStatus, canUseCustomParams } from './subscription';

export interface UrlViewModel {
  originalText: string;
  cleanedText: string;
  cleanedUrl: string;
  canCopy: boolean;
  emptyState?: {
    titleMessageKey: 'emptyStateTitle';
    descriptionMessageKey: 'emptyStateNoUrl';
    actionMessageKey: 'emptyStateOpenPageAction';
  };
}

export type SubscriptionMessageKey = 'premiumStatus' | 'trialStatus' | 'trialStatusOneDay' | 'freeStatus';

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
      canCopy: false,
      emptyState: {
        titleMessageKey: 'emptyStateTitle',
        descriptionMessageKey: 'emptyStateNoUrl',
        actionMessageKey: 'emptyStateOpenPageAction'
      }
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
      messageKey: status.trialDaysLeft === 1 ? 'trialStatusOneDay' : 'trialStatus',
      messageArgs: [status.trialDaysLeft.toString(), status.trialEndsAt.toString()],
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
