import type { StoredSubscriptionState } from '../core/subscription';

export interface LinkCleanerStoredValues extends StoredSubscriptionState {
  customParams?: string[];
}

export type LinkCleanerStorageKey = keyof LinkCleanerStoredValues;
export type LinkCleanerStoragePatch = Partial<LinkCleanerStoredValues>;

export interface LinkCleanerStorageAdapter {
  get(keys: readonly LinkCleanerStorageKey[]): Promise<LinkCleanerStoragePatch>;
  set(values: LinkCleanerStoragePatch): Promise<void>;
}
