export const DEFAULT_PARAMS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'fbclid',
  'gclid',
  'ref',
  '_hsenc',
  '_hsmi',
  'mc_cid',
  'mc_eid',
  'msclkid',
  'yclid'
];

export const TRIAL_PERIOD_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface SubscriptionStatus {
  isPremium: boolean;
  isTrialActive: boolean;
  trialDaysLeft: number;
}

export async function getSubscriptionStatus(): Promise<SubscriptionStatus> {
  if (typeof chrome === 'undefined' || !chrome.storage) {
    return { isPremium: false, isTrialActive: true, trialDaysLeft: 7 };
  }

  return new Promise((resolve) => {
    chrome.storage.local.get(['isPremium', 'trialStartTs'], (result) => {
      const now = Date.now();
      let trialStartTs = result.trialStartTs;

      if (!trialStartTs) {
        trialStartTs = now;
        chrome.storage.local.set({ trialStartTs });
      }

      const isPremium = !!result.isPremium;
      const elapsed = now - trialStartTs;
      const isTrialActive = elapsed < TRIAL_PERIOD_MS;
      const trialDaysLeft = Math.max(0, Math.ceil((TRIAL_PERIOD_MS - elapsed) / (24 * 60 * 60 * 1000)));

      resolve({ isPremium, isTrialActive, trialDaysLeft });
    });
  });
}

export async function getTrackingParams(): Promise<string[]> {
  const status = await getSubscriptionStatus();
  
  if (typeof chrome === 'undefined' || !chrome.storage) {
    return DEFAULT_PARAMS;
  }

  return new Promise((resolve) => {
    chrome.storage.local.get(['customParams'], (result) => {
      const customParams = result.customParams as string[] | undefined;
      // Only allow custom params if premium or trial is active
      if (customParams && (status.isPremium || status.isTrialActive)) {
        // Combine default and custom, then unique
        resolve([...new Set([...DEFAULT_PARAMS, ...customParams])]);
      } else {
        resolve(DEFAULT_PARAMS);
      }
    });
  });
}

export async function saveCustomParam(param: string): Promise<boolean> {
  const status = await getSubscriptionStatus();
  if (!status.isPremium && !status.isTrialActive) {
    return false;
  }

  return new Promise((resolve) => {
    chrome.storage.local.get(['customParams'], (result) => {
      const customParams = (result.customParams as string[] | undefined) || [];
      if (!customParams.includes(param)) {
        customParams.push(param);
        chrome.storage.local.set({ customParams }, () => resolve(true));
      } else {
        resolve(true);
      }
    });
  });
}

export async function buyPremium(): Promise<void> {
  // Simulated Stripe checkout
  return new Promise((resolve) => {
    setTimeout(() => {
      chrome.storage.local.set({ isPremium: true }, () => resolve());
    }, 1000);
  });
}

export function cleanUrl(urlStr: string, paramsToRemove: string[] = DEFAULT_PARAMS): string {
  try {
    const url = new URL(urlStr);

    paramsToRemove.forEach(param => {
      url.searchParams.delete(param);
    });

    // Also remove any parameter starting with utm_ just in case
    const keysToDelete: string[] = [];
    url.searchParams.forEach((_, key) => {
      if (key.startsWith('utm_')) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => url.searchParams.delete(key));

    return url.toString();
  } catch (e) {
    return urlStr;
  }
}
