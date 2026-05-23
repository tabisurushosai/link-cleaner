import { cleanUrl, getTrackingParams } from './url-cleaner';

async function init() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const urlDisplay = document.getElementById('current-url');
  const copyBtn = document.getElementById('copy-btn');
  const status = document.getElementById('status');

  let cleanedUrl = '';

  if (urlDisplay && tab?.url) {
    const params = await getTrackingParams();
    cleanedUrl = cleanUrl(tab.url, params);
    urlDisplay.textContent = cleanedUrl;
  } else if (urlDisplay) {
    urlDisplay.textContent = 'URL not found';
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
