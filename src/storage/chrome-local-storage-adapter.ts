import type {
  LinkCleanerStorageAdapter,
  LinkCleanerStorageKey,
  LinkCleanerStoredValues,
  LinkCleanerStoragePatch
} from './storage-adapter';

function toStoragePatch(
  result: Partial<Record<LinkCleanerStorageKey, unknown>>,
  keys: readonly LinkCleanerStorageKey[]
): LinkCleanerStoragePatch {
  const patch: LinkCleanerStoragePatch = {};

  keys.forEach(key => {
    if (!Object.prototype.hasOwnProperty.call(result, key)) return;

    if (key === 'isPremium') {
      patch.isPremium = result[key] as LinkCleanerStoredValues['isPremium'];
    } else if (key === 'trialStartTs') {
      patch.trialStartTs = result[key] as LinkCleanerStoredValues['trialStartTs'];
    } else {
      patch.customParams = result[key] as LinkCleanerStoredValues['customParams'];
    }
  });

  return patch;
}

function getFromChrome(keys: readonly LinkCleanerStorageKey[]): Promise<LinkCleanerStoragePatch> {
  if (typeof chrome === 'undefined' || !chrome.storage?.local) {
    return Promise.resolve({});
  }

  return new Promise(resolve => {
    chrome.storage.local.get([...keys], result => resolve(toStoragePatch(result, keys)));
  });
}

function setToChrome(values: LinkCleanerStoragePatch): Promise<void> {
  if (typeof chrome === 'undefined' || !chrome.storage?.local) {
    return Promise.resolve();
  }

  return new Promise(resolve => {
    chrome.storage.local.set(values, () => resolve());
  });
}

export const chromeLocalStorageAdapter: LinkCleanerStorageAdapter = {
  get: getFromChrome,
  set: setToChrome
};
