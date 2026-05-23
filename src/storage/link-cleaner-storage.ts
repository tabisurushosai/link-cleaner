import {
  SubscriptionStatus,
  canUseCustomParams,
  evaluateSubscriptionState,
  getEffectiveTrackingParams
} from '../core/subscription';
import type { LinkCleanerStorageAdapter } from './storage-adapter';
export type { LinkCleanerStorageAdapter } from './storage-adapter';

export async function getSubscriptionStatus(
  storage: LinkCleanerStorageAdapter
): Promise<SubscriptionStatus> {
  const result = await storage.readSubscriptionState();
  const evaluation = evaluateSubscriptionState(result);

  if (evaluation.shouldPersistTrialStart) {
    await storage.writeTrialStartTs(evaluation.trialStartTs);
  }

  return evaluation.status;
}

export async function getTrackingParams(
  storage: LinkCleanerStorageAdapter
): Promise<string[]> {
  const status = await getSubscriptionStatus(storage);
  const customParams = await storage.readCustomParams();

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

  const customParams = await storage.readCustomParams() ?? [];

  if (!customParams.includes(param)) {
    await storage.writeCustomParams([...customParams, param]);
  }

  return true;
}

export async function buyPremium(
  storage: LinkCleanerStorageAdapter
): Promise<void> {
  await new Promise<void>(resolve => {
    setTimeout(() => resolve(), 1000);
  });
  await storage.writePremiumState(true);
}
