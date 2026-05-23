import type { StoredSubscriptionState } from '../core/subscription';

export interface LinkCleanerStorageAdapter {
  readSubscriptionState(): Promise<StoredSubscriptionState>;
  writeTrialStartTs(trialStartTs: number): Promise<void>;
  readCustomParams(): Promise<string[] | undefined>;
  writeCustomParams(customParams: string[]): Promise<void>;
  writePremiumState(isPremium: boolean): Promise<void>;
}
