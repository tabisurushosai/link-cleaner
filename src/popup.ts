import { cleanUrl, getTrackingParams, getSubscriptionStatus, buyPremium, saveCustomParam } from './url-cleaner';

async function init() {
  translateUI();
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const originalDisplay = document.getElementById('original-url');
  const cleanedDisplay = document.getElementById('cleaned-url');
  const copyBtn = document.getElementById('copy-btn');
  const statusDisplay = document.getElementById('status');
  
  const subStatusDisplay = document.getElementById('subscription-status');
  const buyBtn = document.getElementById('buy-btn');
  const addParamBtn = document.getElementById('add-param-btn');
  const customParamInput = document.getElementById('custom-param-input') as HTMLInputElement;

  let cleanedUrl = '';

  const refreshUrl = async () => {
    if (tab?.url) {
      if (originalDisplay) originalDisplay.textContent = tab.url;
      const params = await getTrackingParams();
      cleanedUrl = cleanUrl(tab.url, params);
      if (cleanedDisplay) cleanedDisplay.textContent = cleanedUrl;
    } else {
      const errorMsg = chrome.i18n.getMessage('errorNotFound');
      if (originalDisplay) originalDisplay.textContent = errorMsg;
      if (cleanedDisplay) cleanedDisplay.textContent = errorMsg;
    }
  };

  const refreshSubscriptionUI = async () => {
    const status = await getSubscriptionStatus();
    if (subStatusDisplay) {
      if (status.isPremium) {
        subStatusDisplay.textContent = chrome.i18n.getMessage('premiumStatus');
        if (buyBtn) buyBtn.style.display = 'none';
      } else if (status.isTrialActive) {
        subStatusDisplay.textContent = chrome.i18n.getMessage('trialStatus', [status.trialDaysLeft.toString()]);
        if (buyBtn) buyBtn.style.display = 'block';
      } else {
        subStatusDisplay.textContent = chrome.i18n.getMessage('freeStatus');
        if (buyBtn) buyBtn.style.display = 'block';
      }
    }

    if (!status.isPremium && !status.isTrialActive) {
      if (addParamBtn) (addParamBtn as HTMLButtonElement).disabled = true;
      if (customParamInput) customParamInput.disabled = true;
    } else {
      if (addParamBtn) (addParamBtn as HTMLButtonElement).disabled = false;
      if (customParamInput) customParamInput.disabled = false;
    }
  };

  await refreshUrl();
  await refreshSubscriptionUI();

  if (copyBtn && cleanedUrl) {
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(cleanedUrl);
        if (statusDisplay) {
          statusDisplay.textContent = chrome.i18n.getMessage('statusCopied');
          setTimeout(() => {
            statusDisplay.textContent = '';
          }, 2000);
        }
      } catch (err) {
        if (statusDisplay) {
          statusDisplay.textContent = chrome.i18n.getMessage('statusError');
          statusDisplay.style.color = 'red';
        }
      }
    });
  } else if (copyBtn) {
    (copyBtn as HTMLButtonElement).disabled = true;
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
          if (statusDisplay) {
            statusDisplay.textContent = 'Added: ' + param;
            setTimeout(() => { statusDisplay.textContent = ''; }, 2000);
          }
        } else {
          if (statusDisplay) {
            statusDisplay.textContent = chrome.i18n.getMessage('msgPremiumOnly');
            statusDisplay.style.color = 'red';
          }
        }
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
