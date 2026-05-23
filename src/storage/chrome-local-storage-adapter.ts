import type { LinkCleanerStorageAdapter } from './storage-adapter';

interface StoredValues {
  isPremium?: boolean;
  trialStartTs?: number;
  customParams?: string[];
}

type StorageKey = keyof StoredValues;

function getFromChrome(keys: StorageKey[]): Promise<Partial<StoredValues>> {
  if (typeof chrome === 'undefined' || !chrome.storage?.local) {
    return Promise.resolve({});
  }

  return new Promise(resolve => {
    chrome.storage.local.get(keys, result => resolve(result as Partial<StoredValues>));
  });
}

function setToChrome(values: Partial<StoredValues>): Promise<void> {
  if (typeof chrome === 'undefined' || !chrome.storage?.local) {
    return Promise.resolve();
  }

  return new Promise(resolve => {
    chrome.storage.local.set(values, () => resolve());
  });
}

export const chromeLocalStorageAdapter: LinkCleanerStorageAdapter = {
  async readSubscriptionState() {
    const result = await getFromChrome(['isPremium', 'trialStartTs']);
    return {
      isPremium: result.isPremium,
      trialStartTs: result.trialStartTs
    };
  },
  writeTrialStartTs(trialStartTs) {
    return setToChrome({ trialStartTs });
  },
  async readCustomParams() {
    const result = await getFromChrome(['customParams']);
    return Array.isArray(result.customParams) ? result.customParams : undefined;
  },
  writeCustomParams(customParams) {
    return setToChrome({ customParams });
  },
  writePremiumState(isPremium) {
    return setToChrome({ isPremium });
  }
};
