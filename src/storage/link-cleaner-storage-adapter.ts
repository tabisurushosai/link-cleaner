import type {
  StorageAdapter,
  StorageKey,
  StorageSnapshot,
  StorageWrite
} from './storage-adapter';

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
export type LinkCleanerStorageSnapshot<
  TKey extends LinkCleanerStorageKey = LinkCleanerStorageKey
> = StorageSnapshot<LinkCleanerStorageValues, TKey>;
export type LinkCleanerStorageWrite = StorageWrite<LinkCleanerStorageValues>;
export type LinkCleanerStorageAdapter = StorageAdapter<LinkCleanerStorageValues>;
