import {
  SubscriptionStatus,
  canUseCustomParams,
  evaluateSubscriptionState,
  getEffectiveTrackingParams
} from '../core/subscription';

type StorageValues = Record<string, unknown>;

export interface LinkCleanerStorageAdapter {
  get(keys: string[]): Promise<StorageValues>;
  set(values: StorageValues): Promise<void>;
}

export const chromeLocalStorageAdapter: LinkCleanerStorageAdapter = {
  get(keys) {
    if (typeof chrome === 'undefined' || !chrome.storage) {
      return Promise.resolve({});
    }

    return new Promise(resolve => {
      chrome.storage.local.get(keys, result => resolve(result));
    });
  },
  set(values) {
    if (typeof chrome === 'undefined' || !chrome.storage) {
      return Promise.resolve();
    }

    return new Promise(resolve => {
      chrome.storage.local.set(values, () => resolve());
    });
  }
};

export async function getSubscriptionStatus(
  storage: LinkCleanerStorageAdapter = chromeLocalStorageAdapter
): Promise<SubscriptionStatus> {
  const result = await storage.get(['isPremium', 'trialStartTs']);
  const evaluation = evaluateSubscriptionState({
    isPremium: result.isPremium as boolean | undefined,
    trialStartTs: result.trialStartTs as number | undefined
  });

  if (evaluation.shouldPersistTrialStart) {
    await storage.set({ trialStartTs: evaluation.trialStartTs });
  }

  return evaluation.status;
}

export async function getTrackingParams(
  storage: LinkCleanerStorageAdapter = chromeLocalStorageAdapter
): Promise<string[]> {
  const status = await getSubscriptionStatus(storage);
  const result = await storage.get(['customParams']);
  const customParams = Array.isArray(result.customParams) ? result.customParams as string[] : undefined;

  return getEffectiveTrackingParams(customParams, status);
}

export async function saveCustomParam(
  param: string,
  storage: LinkCleanerStorageAdapter = chromeLocalStorageAdapter
): Promise<boolean> {
  const status = await getSubscriptionStatus(storage);
  if (!canUseCustomParams(status)) {
    return false;
  }

  const result = await storage.get(['customParams']);
  const customParams = Array.isArray(result.customParams) ? result.customParams as string[] : [];

  if (!customParams.includes(param)) {
    await storage.set({ customParams: [...customParams, param] });
  }

  return true;
}

export async function buyPremium(
  storage: LinkCleanerStorageAdapter = chromeLocalStorageAdapter
): Promise<void> {
  await new Promise<void>(resolve => {
    setTimeout(() => resolve(), 1000);
  });
  await storage.set({ isPremium: true });
}
