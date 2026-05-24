import type {
  LinkCleanerStorageAdapter,
  LinkCleanerStorageKey,
  LinkCleanerStorageSnapshot,
  LinkCleanerStorageValues,
  LinkCleanerStorageWrite
} from './storage-adapter';

type LinkCleanerRawStorage = Partial<{
  [Key in LinkCleanerStorageKey]: LinkCleanerStorageValues[Key];
}>;

function setSnapshotValue<Key extends LinkCleanerStorageKey>(
  snapshot: LinkCleanerStorageSnapshot,
  key: Key,
  value: LinkCleanerStorageValues[Key]
): void {
  if (value === undefined) return;

  Object.assign(snapshot, { [key]: value });
}

function toStorageSnapshot(
  result: LinkCleanerRawStorage,
  keys: readonly LinkCleanerStorageKey[]
): LinkCleanerStorageSnapshot {
  const snapshot: LinkCleanerStorageSnapshot = {};

  keys.forEach(key => {
    if (!Object.prototype.hasOwnProperty.call(result, key)) return;

    setSnapshotValue(snapshot, key, result[key]);
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
