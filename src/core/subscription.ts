import { DEFAULT_PARAMS } from './url-cleaner';

export const TRIAL_PERIOD_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface SubscriptionStatus {
  isPremium: boolean;
  isTrialActive: boolean;
  trialDaysLeft: number;
}

export interface StoredSubscriptionState {
  isPremium?: boolean;
  trialStartTs?: number;
}

export interface SubscriptionEvaluation {
  status: SubscriptionStatus;
  trialStartTs: number;
  shouldPersistTrialStart: boolean;
}

export function evaluateSubscriptionState(
  state: StoredSubscriptionState,
  now: number = Date.now()
): SubscriptionEvaluation {
  const shouldPersistTrialStart = !state.trialStartTs;
  const trialStartTs = state.trialStartTs || now;
  const isPremium = !!state.isPremium;
  const elapsed = now - trialStartTs;
  const isTrialActive = elapsed < TRIAL_PERIOD_MS;
  const trialDaysLeft = Math.max(0, Math.ceil((TRIAL_PERIOD_MS - elapsed) / (24 * 60 * 60 * 1000)));

  return {
    status: { isPremium, isTrialActive, trialDaysLeft },
    trialStartTs,
    shouldPersistTrialStart
  };
}

export function canUseCustomParams(status: SubscriptionStatus): boolean {
  return status.isPremium || status.isTrialActive;
}

export function getEffectiveTrackingParams(
  customParams: string[] | undefined,
  status: SubscriptionStatus,
  defaultParams: string[] = DEFAULT_PARAMS
): string[] {
  if (customParams && canUseCustomParams(status)) {
    return [...new Set([...defaultParams, ...customParams])];
  }

  return defaultParams;
}
