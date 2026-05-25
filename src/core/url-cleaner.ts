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
] as const;

export function cleanUrl(urlStr: string, paramsToRemove: readonly string[] = DEFAULT_PARAMS): string {
  try {
    const url = new URL(urlStr);

    getTrackingKeysToDelete(url.searchParams, paramsToRemove)
      .forEach(key => url.searchParams.delete(key));

    return url.toString();
  } catch {
    return urlStr;
  }
}

function getTrackingKeysToDelete(
  searchParams: URLSearchParams,
  paramsToRemove: readonly string[]
): string[] {
  const configuredParams = new Set(paramsToRemove);
  const keysToDelete: string[] = [];

  searchParams.forEach((_, key) => {
    if (configuredParams.has(key) || key.startsWith('utm_')) {
      keysToDelete.push(key);
    }
  });

  return keysToDelete;
}
