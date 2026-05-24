export type StorageKey<TValues> = Extract<keyof TValues, string>;
export type StorageReadResult<
  TValues,
  TKey extends StorageKey<TValues> = StorageKey<TValues>
> = Partial<Pick<TValues, TKey>>;
export type StorageSnapshot<
  TValues,
  TKey extends StorageKey<TValues> = StorageKey<TValues>
> = StorageReadResult<TValues, TKey>;
export type StorageWrite<TValues> = Readonly<Partial<TValues>>;

export interface StorageReader<TValues> {
  read<TKey extends StorageKey<TValues>>(
    keys: readonly TKey[]
  ): Promise<StorageReadResult<TValues, TKey>>;
}

export interface StorageWriter<TValues> {
  write(values: StorageWrite<TValues>): Promise<void>;
}

export type StorageAdapter<TValues> = StorageReader<TValues> & StorageWriter<TValues>;

export function createStorageSnapshot<
  TValues,
  TKey extends StorageKey<TValues>
>(
  values: Partial<TValues>,
  keys: readonly TKey[]
): StorageReadResult<TValues, TKey> {
  const snapshot: StorageReadResult<TValues, TKey> = {};

  keys.forEach(key => {
    if (!Object.prototype.hasOwnProperty.call(values, key)) return;

    const value = values[key];
    if (value === undefined) return;

    Object.assign(snapshot, { [key]: value });
  });

  return snapshot;
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
export type LinkCleanerStorageSnapshot<
  TKey extends LinkCleanerStorageKey = LinkCleanerStorageKey
> = StorageSnapshot<LinkCleanerStorageValues, TKey>;
export type LinkCleanerStorageWrite = StorageWrite<LinkCleanerStorageValues>;
export type LinkCleanerStorageAdapter = StorageAdapter<LinkCleanerStorageValues>;
