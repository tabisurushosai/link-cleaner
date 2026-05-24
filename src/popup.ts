import { createSubscriptionViewModel, createUrlViewModel } from './core/popup-view-model';
import {
  buyPremium,
  getSubscriptionStatus,
  getTrackingParams,
  saveCustomParam
} from './storage/link-cleaner-storage';
import { chromeLocalStorageAdapter } from './storage/chrome-local-storage-adapter';

async function init() {
  const uiLanguage = chrome.i18n.getUILanguage().toLowerCase().startsWith('en') ? 'en' : 'ja';
  const numberFormatter = new Intl.NumberFormat(uiLanguage);

  translateUI();
  document.documentElement.lang = uiLanguage;

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const originalDisplay = document.getElementById('original-url');
  const cleanedDisplay = document.getElementById('cleaned-url');
  const emptyStateDisplay = document.getElementById('empty-state');
  const copyBtn = document.getElementById('copy-btn') as HTMLButtonElement | null;
  const statusDisplay = document.getElementById('status');

  const subStatusDisplay = document.getElementById('subscription-status');
  const buyBtn = document.getElementById('buy-btn') as HTMLButtonElement | null;
  const addParamBtn = document.getElementById('add-param-btn') as HTMLButtonElement | null;
  const customParamInput = document.getElementById('custom-param-input') as HTMLInputElement | null;

  let cleanedUrl = '';

  const setStatus = (message: string, isError = false) => {
    if (!statusDisplay) return;
    statusDisplay.textContent = message;
    statusDisplay.classList.toggle('is-error', isError);
    statusDisplay.setAttribute('aria-live', isError ? 'assertive' : 'polite');
  };

  const setDisabled = (element: HTMLButtonElement | HTMLInputElement | null, disabled: boolean) => {
    if (!element) return;
    element.disabled = disabled;
    element.setAttribute('aria-disabled', String(disabled));
  };

  const clearStatus = () => {
    setStatus('');
  };

  const formatSubscriptionMessageArgs = (messageKey: string, args?: string[]) => {
    if (!args) return undefined;
    if (messageKey === 'trialStatus' || messageKey === 'trialStatusOneDay') {
      return args.map(arg => numberFormatter.format(Number(arg)));
    }
    return args;
  };

  const refreshUrl = async () => {
    const params = tab?.url ? await getTrackingParams(chromeLocalStorageAdapter) : [];
    const viewModel = createUrlViewModel(tab?.url, params, chrome.i18n.getMessage('errorNotFound'));
    cleanedUrl = viewModel.cleanedUrl;
    if (originalDisplay) originalDisplay.textContent = viewModel.originalText;
    if (cleanedDisplay) cleanedDisplay.textContent = viewModel.cleanedText;
    if (emptyStateDisplay) {
      emptyStateDisplay.hidden = !viewModel.emptyStateMessageKey;
      emptyStateDisplay.textContent = viewModel.emptyStateMessageKey
        ? chrome.i18n.getMessage(viewModel.emptyStateMessageKey)
        : '';
    }
    setDisabled(copyBtn, !viewModel.canCopy);
  };

  const refreshSubscriptionUI = async () => {
    const status = await getSubscriptionStatus(chromeLocalStorageAdapter);
    const viewModel = createSubscriptionViewModel(status);
    if (subStatusDisplay) {
      subStatusDisplay.textContent = chrome.i18n.getMessage(
        viewModel.messageKey,
        formatSubscriptionMessageArgs(viewModel.messageKey, viewModel.messageArgs)
      );
    }
    if (buyBtn) buyBtn.hidden = !viewModel.showBuyButton;

    if (!viewModel.canEditCustomParams) {
      setDisabled(addParamBtn, true);
      setDisabled(customParamInput, true);
    } else {
      setDisabled(addParamBtn, false);
      setDisabled(customParamInput, false);
    }
  };

  await refreshUrl();
  await refreshSubscriptionUI();

  if (copyBtn && cleanedUrl) {
    setDisabled(copyBtn, false);
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(cleanedUrl);
        setStatus(chrome.i18n.getMessage('statusCopied'));
        setTimeout(clearStatus, 2000);
      } catch (err) {
        setStatus(chrome.i18n.getMessage('statusError'), true);
      }
    });
  } else if (copyBtn) {
    setDisabled(copyBtn, true);
  }

  if (buyBtn) {
    buyBtn.addEventListener('click', async () => {
      const buyButtonText = chrome.i18n.getMessage('buttonBuy');
      setDisabled(buyBtn, true);
      buyBtn.setAttribute('aria-busy', 'true');
      buyBtn.textContent = chrome.i18n.getMessage('statusProcessing');
      try {
        await buyPremium(chromeLocalStorageAdapter);
        await refreshSubscriptionUI();
        await refreshUrl();
      } finally {
        buyBtn.removeAttribute('aria-busy');
        if (!buyBtn.hidden) {
          buyBtn.textContent = buyButtonText;
          setDisabled(buyBtn, false);
        }
      }
    });
  }

  if (addParamBtn && customParamInput) {
    addParamBtn.addEventListener('click', async () => {
      const param = customParamInput.value.trim();
      if (param) {
        const success = await saveCustomParam(param, chromeLocalStorageAdapter);
        if (success) {
          customParamInput.value = '';
          await refreshUrl();
          setStatus(chrome.i18n.getMessage('statusRuleAdded', param));
          setTimeout(clearStatus, 2000);
        } else {
          setStatus(chrome.i18n.getMessage('msgPremiumOnly'), true);
        }
      }
    });

    customParamInput.addEventListener('keydown', event => {
      if (event.key === 'Enter' && !addParamBtn.disabled) {
        event.preventDefault();
        addParamBtn.click();
      }
    });
  }
}

function translateUI() {
  translateTextContent();
  translateAttribute('[data-i18n-placeholder]', 'data-i18n-placeholder', 'placeholder');
  translateAttribute('[data-i18n-aria-label]', 'data-i18n-aria-label', 'aria-label');
}

function translateTextContent() {
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (key) {
      const message = chrome.i18n.getMessage(key);
      if (message) {
        el.textContent = message;
      }
    }
  });
}

function translateAttribute(selector: string, keyAttribute: string, targetAttribute: string) {
  const elements = document.querySelectorAll(selector);
  elements.forEach(el => {
    const key = el.getAttribute(keyAttribute);
    if (key) {
      const message = chrome.i18n.getMessage(key);
      if (message) {
        el.setAttribute(targetAttribute, message);
      }
    }
  });
}

init();
