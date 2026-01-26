/**
 * Check if URL is external (different domain) or internal
 */
export const isExternalUrl = (url: string): boolean => {
  if (!url.startsWith('http')) return false;

  try {
    const urlObj = new URL(url);
    const currentHost =
      typeof window !== 'undefined' ? window.location.hostname : '';
    return urlObj.hostname !== currentHost;
  } catch {
    return false;
  }
};

/**
 * Handle navigation for internal or external links
 */
export const navigateToUrl = (
  url: string,
  router: { push: (url: string) => void }
): void => {
  if (isExternalUrl(url)) {
    window.open(url, '_blank', 'noopener,noreferrer');
  } else {
    router.push(url);
  }
};

/**
 * Convert absolute URL to relative path for current app
 */
export const convertToRelativePath = (url: string): string => {
  if (!url.startsWith('http')) return url;

  try {
    const urlObj = new URL(url);
    const currentHostname =
      typeof window !== 'undefined'
        ? window.location.hostname
        : process.env.NEXT_PUBLIC_APP_HOSTNAME || 'bridge.honeypotfinance.xyz';

    // If it's the current app's URL, convert to relative path
    if (urlObj.hostname === currentHostname) {
      return urlObj.pathname + urlObj.search + urlObj.hash;
    }
    // Otherwise keep the absolute URL
    return url;
  } catch {
    return url;
  }
};
