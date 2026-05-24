export type StorageKey<TValues> = Extract<keyof TValues, string>;
export type StorageSnapshot<TValues> = Partial<TValues>;
export type StorageWrite<TValues> = Partial<TValues>;

export interface StorageAdapter<
  TValues,
  TKey extends StorageKey<TValues> = StorageKey<TValues>
> {
  read(keys: readonly TKey[]): Promise<StorageSnapshot<TValues>>;
  write(values: StorageWrite<TValues>): Promise<void>;
}

export interface LinkCleanerStorageValues {
  isPremium?: boolean;
  trialStartTs?: number;
  customParams?: string[];
}

export const LINK_CLEANER_STORAGE_KEYS = [
  'isPremium',
  'trialStartTs',
  'customParams'
] as const satisfies readonly StorageKey<LinkCleanerStorageValues>[];

export type LinkCleanerStorageKey = (typeof LINK_CLEANER_STORAGE_KEYS)[number];
export type LinkCleanerStorageSnapshot = StorageSnapshot<LinkCleanerStorageValues>;
export type LinkCleanerStorageWrite = StorageWrite<LinkCleanerStorageValues>;
export type LinkCleanerStorageAdapter = StorageAdapter<
  LinkCleanerStorageValues,
  LinkCleanerStorageKey
>;
