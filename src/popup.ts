import { cleanUrl, getTrackingParams } from './url-cleaner';

async function init() {
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
    if (originalDisplay) originalDisplay.textContent = 'URL not found';
    if (cleanedDisplay) cleanedDisplay.textContent = 'URL not found';
  }

  if (copyBtn && cleanedUrl) {
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(cleanedUrl);
        if (status) {
          status.textContent = 'コピーしました！';
          setTimeout(() => {
            status.textContent = '';
          }, 2000);
        }
      } catch (err) {
        if (status) {
          status.textContent = 'エラーが発生しました';
          status.style.color = 'red';
        }
      }
    });
  } else if (copyBtn) {
    (copyBtn as HTMLButtonElement).disabled = true;
  }
}

init();
