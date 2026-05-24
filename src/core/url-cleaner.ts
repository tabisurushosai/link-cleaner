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

export function cleanUrl(urlStr: string, paramsToRemove: string[] = DEFAULT_PARAMS): string {
  try {
    const url = new URL(urlStr);

    paramsToRemove.forEach(param => {
      url.searchParams.delete(param);
    });

    const keysToDelete: string[] = [];
    url.searchParams.forEach((_, key) => {
      if (key.startsWith('utm_')) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => url.searchParams.delete(key));

    return url.toString();
  } catch {
    return urlStr;
  }
}
