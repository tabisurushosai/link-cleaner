import {
  canUseCustomParams,
  evaluateSubscriptionState,
  getEffectiveTrackingParams,
  type SubscriptionStatus
} from '../core/subscription';
import type { LinkCleanerStorageAdapter } from './link-cleaner-storage-adapter';
export type { LinkCleanerStorageAdapter } from './link-cleaner-storage-adapter';

export async function getSubscriptionStatus(
  storage: LinkCleanerStorageAdapter
): Promise<SubscriptionStatus> {
  const result = await storage.read(['isPremium', 'trialStartTs']);
  const evaluation = evaluateSubscriptionState(result);

  if (evaluation.shouldPersistTrialStart) {
    await storage.write({ trialStartTs: evaluation.trialStartTs });
  }

  return evaluation.status;
}

export async function getTrackingParams(
  storage: LinkCleanerStorageAdapter
): Promise<string[]> {
  const status = await getSubscriptionStatus(storage);
  const result = await storage.read(['customParams']);
  const customParams = Array.isArray(result.customParams) ? result.customParams : undefined;

  return getEffectiveTrackingParams(customParams, status);
}

export async function saveCustomParam(
  param: string,
  storage: LinkCleanerStorageAdapter
): Promise<boolean> {
  const status = await getSubscriptionStatus(storage);
  if (!canUseCustomParams(status)) {
    return false;
  }

  const result = await storage.read(['customParams']);
  const customParams = Array.isArray(result.customParams) ? result.customParams : [];

  if (!customParams.includes(param)) {
    await storage.write({ customParams: [...customParams, param] });
  }

  return true;
}

export async function buyPremium(
  storage: LinkCleanerStorageAdapter
): Promise<void> {
  await new Promise<void>(resolve => {
    setTimeout(() => resolve(), 1000);
  });
  await storage.write({ isPremium: true });
}
