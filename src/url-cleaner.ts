export function cleanUrl(urlStr: string): string {
  try {
    const url = new URL(urlStr);
    const paramsToRemove = [
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
