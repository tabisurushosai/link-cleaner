import { createSubscriptionViewModel, createUrlViewModel } from './core/popup-view-model';
import {
  buyPremium,
  getSubscriptionStatus,
  getTrackingParams,
  saveCustomParam
} from './storage/link-cleaner-storage';

async function init() {
  translateUI();
  document.documentElement.lang = chrome.i18n.getUILanguage().split('-')[0] || 'ja';

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const originalDisplay = document.getElementById('original-url');
  const cleanedDisplay = document.getElementById('cleaned-url');
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
  };

  const clearStatus = () => {
    setStatus('');
  };

  const refreshUrl = async () => {
    const params = tab?.url ? await getTrackingParams() : [];
    const viewModel = createUrlViewModel(tab?.url, params, chrome.i18n.getMessage('errorNotFound'));
    cleanedUrl = viewModel.cleanedUrl;
    if (originalDisplay) originalDisplay.textContent = viewModel.originalText;
    if (cleanedDisplay) cleanedDisplay.textContent = viewModel.cleanedText;
  };

  const refreshSubscriptionUI = async () => {
    const status = await getSubscriptionStatus();
    const viewModel = createSubscriptionViewModel(status);
    if (subStatusDisplay) {
      subStatusDisplay.textContent = chrome.i18n.getMessage(viewModel.messageKey, viewModel.messageArgs);
    }
    if (buyBtn) buyBtn.hidden = !viewModel.showBuyButton;

    if (!viewModel.canEditCustomParams) {
      if (addParamBtn) addParamBtn.disabled = true;
      if (customParamInput) customParamInput.disabled = true;
    } else {
      if (addParamBtn) addParamBtn.disabled = false;
      if (customParamInput) customParamInput.disabled = false;
    }
  };

  await refreshUrl();
  await refreshSubscriptionUI();

  if (copyBtn && cleanedUrl) {
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
    copyBtn.disabled = true;
  }

  if (buyBtn) {
    buyBtn.addEventListener('click', async () => {
      buyBtn.textContent = '...';
      await buyPremium();
      await refreshSubscriptionUI();
      await refreshUrl();
    });
  }

  if (addParamBtn && customParamInput) {
    addParamBtn.addEventListener('click', async () => {
      const param = customParamInput.value.trim();
      if (param) {
        const success = await saveCustomParam(param);
        if (success) {
          customParamInput.value = '';
          await refreshUrl();
          setStatus('Added: ' + param);
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

  const placeholders = document.querySelectorAll('[data-i18n-placeholder]');
  placeholders.forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (key) {
      const message = chrome.i18n.getMessage(key);
      if (message) {
        (el as HTMLInputElement).placeholder = message;
      }
    }
  });
}

init();
