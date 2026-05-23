import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getSubscriptionStatus, TRIAL_PERIOD_MS } from './url-cleaner';

// Mock chrome API
const chromeMock = {
  storage: {
    local: {
      get: vi.fn(),
      set: vi.fn(),
    },
  },
};

vi.stubGlobal('chrome', chromeMock);

describe('Subscription Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize trial for new users', async () => {
    chromeMock.storage.local.get.mockImplementation((keys, callback) => {
      callback({});
    });
    chromeMock.storage.local.set.mockImplementation((data, callback) => {
      if (callback) callback();
    });

    const status = await getSubscriptionStatus();
    
    expect(chromeMock.storage.local.set).toHaveBeenCalledWith(
      expect.objectContaining({ trialStartTs: expect.any(Number) })
    );
    expect(status.isPremium).toBe(false);
    expect(status.isTrialActive).toBe(true);
    expect(status.trialDaysLeft).toBe(7);
  });

  it('should detect premium users', async () => {
    chromeMock.storage.local.get.mockImplementation((keys, callback) => {
      callback({ isPremium: true, trialStartTs: Date.now() });
    });

    const status = await getSubscriptionStatus();
    expect(status.isPremium).toBe(true);
  });

  it('should detect expired trial', async () => {
    const longAgo = Date.now() - (TRIAL_PERIOD_MS + 1000);
    chromeMock.storage.local.get.mockImplementation((keys, callback) => {
      callback({ isPremium: false, trialStartTs: longAgo });
    });

    const status = await getSubscriptionStatus();
    expect(status.isTrialActive).toBe(false);
    expect(status.trialDaysLeft).toBe(0);
  });
});
