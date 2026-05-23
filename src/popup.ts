import { cleanUrl, getTrackingParams } from './url-cleaner';

async function init() {
  translateUI();
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const originalDisplay = document.getElementById('original-url');
  const cleanedDisplay = document.getElementById('cleaned-url');
  const copyBtn = document.getElementById('copy-btn');
  const status = document.getElementById('status');

  let cleanedUrl = '';

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

  if (copyBtn && cleanedUrl) {
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(cleanedUrl);
        if (status) {
          status.textContent = chrome.i18n.getMessage('statusCopied');
          setTimeout(() => {
            status.textContent = '';
          }, 2000);
        }
      } catch (err) {
        if (status) {
          status.textContent = chrome.i18n.getMessage('statusError');
          status.style.color = 'red';
        }
      }
    });
  } else if (copyBtn) {
    (copyBtn as HTMLButtonElement).disabled = true;
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
}

init();
