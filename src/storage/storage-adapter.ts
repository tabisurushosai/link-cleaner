import type { StoredSubscriptionState } from '../core/subscription';

export interface LinkCleanerStorageValues extends StoredSubscriptionState {
  customParams?: string[];
}

export const LINK_CLEANER_STORAGE_KEYS = [
  'isPremium',
  'trialStartTs',
  'customParams'
] as const satisfies readonly (keyof LinkCleanerStorageValues)[];

export type LinkCleanerStorageKey = (typeof LINK_CLEANER_STORAGE_KEYS)[number];
export type LinkCleanerStorageSnapshot = Partial<LinkCleanerStorageValues>;
export type LinkCleanerStorageWrite = Partial<LinkCleanerStorageValues>;

export interface LinkCleanerStorageAdapter {
  read(keys: readonly LinkCleanerStorageKey[]): Promise<LinkCleanerStorageSnapshot>;
  write(values: LinkCleanerStorageWrite): Promise<void>;
}
