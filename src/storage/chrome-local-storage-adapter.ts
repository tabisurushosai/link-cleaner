import type {
  LinkCleanerStorageAdapter,
  LinkCleanerStorageKey,
  LinkCleanerStorageSnapshot,
  LinkCleanerStorageValues,
  LinkCleanerStorageWrite
} from './link-cleaner-storage-adapter';
import { createStorageSnapshot } from './storage-adapter';

function readFromChrome<TKey extends LinkCleanerStorageKey>(
  keys: readonly TKey[]
): Promise<LinkCleanerStorageSnapshot<TKey>> {
  if (typeof chrome === 'undefined' || !chrome.storage?.local) {
    return Promise.resolve({});
  }

  return new Promise(resolve => {
    chrome.storage.local.get([...keys], result => {
      resolve(createStorageSnapshot(result as Partial<LinkCleanerStorageValues>, keys));
    });
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
