import { createSubscriptionViewModel, createUrlViewModel } from './core/popup-view-model';
import {
  buyPremium,
  getSubscriptionStatus,
  getTrackingParams,
  saveCustomParam
} from './storage/link-cleaner-storage';
import { chromeLocalStorageAdapter } from './storage/chrome-local-storage-adapter';
import {
  formatMessageArgs,
  formatUsdPrice,
  getSupportedLocale,
  type MessageArgs,
  PREMIUM_PRICE_USD
} from './core/i18n-formatting';

type GetMessage = (messageKey: string, args?: MessageArgs) => string;

async function init() {
  const uiLanguage = getSupportedLocale(chrome.i18n.getUILanguage());
  const premiumPrice = formatUsdPrice(PREMIUM_PRICE_USD, uiLanguage);
  const getMessage: GetMessage = (messageKey, args) => chrome.i18n.getMessage(
    messageKey,
    formatMessageArgs(messageKey, args, premiumPrice, uiLanguage)
  );

  translateUI(getMessage);
  document.documentElement.lang = uiLanguage;

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const originalDisplay = getElementById('original-url');
  const cleanedDisplay = getElementById('cleaned-url');
  const emptyStateDisplay = getElementById('empty-state');
  const emptyStateTitle = getElementById('empty-state-title');
  const emptyStateDescription = getElementById('empty-state-description');
  const emptyStateAction = getElementById('empty-state-action');
  const copyBtn = getElementById<HTMLButtonElement>('copy-btn');
  const statusDisplay = getElementById('status');

  const subStatusDisplay = getElementById('subscription-status');
  const buyBtn = getElementById<HTMLButtonElement>('buy-btn');
  const addParamBtn = getElementById<HTMLButtonElement>('add-param-btn');
  const customParamInput = getElementById<HTMLInputElement>('custom-param-input');

  let cleanedUrl = '';

  const setStatus = (message: string, isError = false) => {
    if (!statusDisplay) return;
    statusDisplay.classList.toggle('is-error', isError);
    statusDisplay.setAttribute('aria-live', isError ? 'assertive' : 'polite');
    statusDisplay.textContent = message;
  };

  const setDisabled = (element: HTMLButtonElement | HTMLInputElement | null, disabled: boolean) => {
    if (!element) return;
    element.disabled = disabled;
    element.setAttribute('aria-disabled', String(disabled));
  };

  const clearStatus = () => {
    setStatus('');
  };

  const setBusy = (element: HTMLElement | null, busy: boolean) => {
    if (!element) return;
    if (busy) {
      element.setAttribute('aria-busy', 'true');
    } else {
      element.removeAttribute('aria-busy');
    }
  };

  const refreshUrl = async () => {
    setBusy(originalDisplay, true);
    setBusy(cleanedDisplay, true);

    const params = tab?.url ? await getTrackingParams(chromeLocalStorageAdapter) : [];
    const viewModel = createUrlViewModel(tab?.url, params, getMessage('errorNotFound'));
    const urlGuidance = viewModel.emptyState ?? viewModel.guidanceState;
    cleanedUrl = viewModel.cleanedUrl;
    if (originalDisplay) {
      originalDisplay.textContent = viewModel.originalText;
      originalDisplay.classList.remove('is-loading');
      originalDisplay.classList.toggle('is-empty', Boolean(viewModel.emptyState));
      setBusy(originalDisplay, false);
    }
    if (cleanedDisplay) {
      cleanedDisplay.textContent = viewModel.cleanedText;
      cleanedDisplay.classList.remove('is-loading');
      cleanedDisplay.classList.toggle('is-empty', Boolean(viewModel.emptyState));
      cleanedDisplay.classList.toggle('is-cleaned', viewModel.canCopy);
      setBusy(cleanedDisplay, false);
    }
    if (emptyStateDisplay) {
      emptyStateDisplay.hidden = !urlGuidance;
      emptyStateDisplay.classList.toggle('is-info', Boolean(viewModel.guidanceState));
    }
    if (emptyStateTitle) {
      emptyStateTitle.textContent = urlGuidance
        ? getMessage(urlGuidance.titleMessageKey)
        : '';
    }
    if (emptyStateDescription) {
      emptyStateDescription.textContent = urlGuidance
        ? getMessage(urlGuidance.descriptionMessageKey)
        : '';
    }
    if (emptyStateAction) {
      emptyStateAction.textContent = urlGuidance
        ? getMessage(urlGuidance.actionMessageKey)
        : '';
    }
    setDisabled(copyBtn, !viewModel.canCopy);
  };

  const refreshSubscriptionUI = async () => {
    const status = await getSubscriptionStatus(chromeLocalStorageAdapter);
    const viewModel = createSubscriptionViewModel(status);
    if (subStatusDisplay) {
      subStatusDisplay.textContent = getMessage(
        viewModel.messageKey,
        viewModel.messageArgs
      );
    }
    if (buyBtn) buyBtn.hidden = !viewModel.showBuyButton;

    setDisabled(addParamBtn, !viewModel.canEditCustomParams);
    setDisabled(customParamInput, !viewModel.canEditCustomParams);
  };

  await refreshUrl();
  await refreshSubscriptionUI();

  if (copyBtn && cleanedUrl) {
    setDisabled(copyBtn, false);
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(cleanedUrl);
        setStatus(getMessage('statusCopied'));
        setTimeout(clearStatus, 2000);
      } catch {
        setStatus(getMessage('statusError'), true);
      }
    });
  } else if (copyBtn) {
    setDisabled(copyBtn, true);
  }

  if (buyBtn) {
    buyBtn.addEventListener('click', async () => {
      const buyButtonText = getMessage('buttonBuy');
      setDisabled(buyBtn, true);
      buyBtn.setAttribute('aria-busy', 'true');
      buyBtn.textContent = getMessage('statusProcessing');
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
          setStatus(getMessage('statusRuleAdded', param));
          setTimeout(clearStatus, 2000);
        } else {
          setStatus(getMessage('msgPremiumOnly'), true);
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

function getElementById<TElement extends HTMLElement = HTMLElement>(id: string): TElement | null {
  return document.getElementById(id) as TElement | null;
}

function translateUI(getMessage: GetMessage) {
  translateTextContent(getMessage);
  translateAttribute(getMessage, '[data-i18n-placeholder]', 'data-i18n-placeholder', 'placeholder');
  translateAttribute(getMessage, '[data-i18n-aria-label]', 'data-i18n-aria-label', 'aria-label');
}

function translateTextContent(getMessage: GetMessage) {
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (key) {
      const message = getMessage(key);
      if (message) {
        el.textContent = message;
      }
    }
  });
}

function translateAttribute(
  getMessage: GetMessage,
  selector: string,
  keyAttribute: string,
  targetAttribute: string
) {
  const elements = document.querySelectorAll(selector);
  elements.forEach(el => {
    const key = el.getAttribute(keyAttribute);
    if (key) {
      const message = getMessage(key);
      if (message) {
        el.setAttribute(targetAttribute, message);
      }
    }
  });
}

init();
