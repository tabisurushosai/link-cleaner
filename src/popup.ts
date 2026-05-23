import { cleanUrl } from './url-cleaner';

async function init() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const urlDisplay = document.getElementById('current-url');
  if (urlDisplay) {
    if (tab?.url) {
      urlDisplay.textContent = cleanUrl(tab.url);
    } else {
      urlDisplay.textContent = 'URL not found';
    }
  }
}

init();
