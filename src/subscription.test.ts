import { describe, it, expect } from 'vitest';
import { TRIAL_PERIOD_MS } from './core/subscription';
import { getSubscriptionStatus, type LinkCleanerStorageAdapter } from './storage/link-cleaner-storage';

interface MemoryStorageState {
  isPremium?: boolean;
  trialStartTs?: number;
  customParams?: string[];
}

function createMemoryStorage(initial: MemoryStorageState = {}) {
  const state: MemoryStorageState = { ...initial };
  const adapter: LinkCleanerStorageAdapter = {
    async get(keys) {
      return Object.fromEntries(
        keys.map(key => [key, state[key]])
      ) as Partial<MemoryStorageState>;
    },
    async set(values) {
      Object.assign(state, values);
    }
  };

  return { adapter, state };
}

describe('Subscription Logic', () => {
  it('should initialize trial for new users', async () => {
    const { adapter, state } = createMemoryStorage();

    const status = await getSubscriptionStatus(adapter);

    expect(state.trialStartTs).toEqual(expect.any(Number));
    expect(status.isPremium).toBe(false);
    expect(status.isTrialActive).toBe(true);
    expect(status.trialDaysLeft).toBe(7);
  });

  it('should detect premium users', async () => {
    const { adapter } = createMemoryStorage({ isPremium: true, trialStartTs: Date.now() });

    const status = await getSubscriptionStatus(adapter);
    expect(status.isPremium).toBe(true);
  });

  it('should detect expired trial', async () => {
    const longAgo = Date.now() - (TRIAL_PERIOD_MS + 1000);
    const { adapter } = createMemoryStorage({ isPremium: false, trialStartTs: longAgo });

    const status = await getSubscriptionStatus(adapter);
    expect(status.isTrialActive).toBe(false);
    expect(status.trialDaysLeft).toBe(0);
  });
});
