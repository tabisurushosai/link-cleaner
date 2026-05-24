import type {
  LinkCleanerStorageAdapter,
  LinkCleanerStorageKey,
  LinkCleanerStorageSnapshot,
  LinkCleanerStorageWrite
} from './storage-adapter';
import { createStorageSnapshot } from './storage-adapter';

function readFromChrome(keys: readonly LinkCleanerStorageKey[]): Promise<LinkCleanerStorageSnapshot> {
  if (typeof chrome === 'undefined' || !chrome.storage?.local) {
    return Promise.resolve({});
  }

  return new Promise(resolve => {
    chrome.storage.local.get([...keys], result => {
      resolve(createStorageSnapshot(result as LinkCleanerStorageSnapshot, keys));
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
