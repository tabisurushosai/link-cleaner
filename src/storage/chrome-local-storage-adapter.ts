import type {
  LinkCleanerStorageAdapter,
  LinkCleanerStorageKey,
  LinkCleanerStorageSnapshot,
  LinkCleanerStorageValues,
  LinkCleanerStorageWrite
} from './storage-adapter';

function toStorageSnapshot(
  result: Partial<Record<LinkCleanerStorageKey, unknown>>,
  keys: readonly LinkCleanerStorageKey[]
): LinkCleanerStorageSnapshot {
  const snapshot: LinkCleanerStorageSnapshot = {};

  keys.forEach(key => {
    if (!Object.prototype.hasOwnProperty.call(result, key)) return;

    if (key === 'isPremium') {
      snapshot.isPremium = result[key] as LinkCleanerStorageValues['isPremium'];
    } else if (key === 'trialStartTs') {
      snapshot.trialStartTs = result[key] as LinkCleanerStorageValues['trialStartTs'];
    } else {
      snapshot.customParams = result[key] as LinkCleanerStorageValues['customParams'];
    }
  });

  return snapshot;
}

function readFromChrome(keys: readonly LinkCleanerStorageKey[]): Promise<LinkCleanerStorageSnapshot> {
  if (typeof chrome === 'undefined' || !chrome.storage?.local) {
    return Promise.resolve({});
  }

  return new Promise(resolve => {
    chrome.storage.local.get([...keys], result => resolve(toStorageSnapshot(result, keys)));
  });
}

function writeToChrome(values: LinkCleanerStorageWrite): Promise<void> {
  if (typeof chrome === 'undefined' || !chrome.storage?.local) {
    return Promise.resolve();
  }

  return new Promise(resolve => {
    chrome.storage.local.set(values, () => resolve());
  });
}

export const chromeLocalStorageAdapter: LinkCleanerStorageAdapter = {
  read: readFromChrome,
  write: writeToChrome
};
