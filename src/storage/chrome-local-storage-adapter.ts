import type {
  LinkCleanerStorageAdapter,
  LinkCleanerStorageKey,
  LinkCleanerStoragePatch
} from './storage-adapter';

function getFromChrome(keys: readonly LinkCleanerStorageKey[]): Promise<LinkCleanerStoragePatch> {
  if (typeof chrome === 'undefined' || !chrome.storage?.local) {
    return Promise.resolve({});
  }

  return new Promise(resolve => {
    chrome.storage.local.get([...keys], result => resolve(result as LinkCleanerStoragePatch));
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
