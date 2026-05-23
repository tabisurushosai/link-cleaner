export const DEFAULT_PARAMS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'fbclid',
  'gclid',
  'ref',
  '_hsenc',
  '_hsmi',
  'mc_cid',
  'mc_eid',
  'msclkid',
  'yclid'
];

export async function getTrackingParams(): Promise<string[]> {
  if (typeof chrome === 'undefined' || !chrome.storage) {
    return DEFAULT_PARAMS;
  }

  return new Promise((resolve) => {
    chrome.storage.local.get(['customParams'], (result) => {
      const customParams = result.customParams as string[] | undefined;
      if (customParams) {
        // Combine default and custom, then unique
        resolve([...new Set([...DEFAULT_PARAMS, ...customParams])]);
      } else {
        resolve(DEFAULT_PARAMS);
      }
    });
  });
}

export function cleanUrl(urlStr: string, paramsToRemove: string[] = DEFAULT_PARAMS): string {
  try {
    const url = new URL(urlStr);

    paramsToRemove.forEach(param => {
      url.searchParams.delete(param);
    });

    // Also remove any parameter starting with utm_ just in case
    const keysToDelete: string[] = [];
    url.searchParams.forEach((_, key) => {
      if (key.startsWith('utm_')) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => url.searchParams.delete(key));

    return url.toString();
  } catch (e) {
    return urlStr;
  }
}
