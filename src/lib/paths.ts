/**
 * Returns the base path (no trailing slash) derived from Astro.site.
 * If at root, returns an empty string so hrefs can fall back to "/".
 */
export function getBasePath(site?: URL | string | null): string {
  if (!site) return '';
  const url = typeof site === 'string' ? new URL(site) : site;
  const pathname = url?.pathname ?? '';
  if (pathname === '/' || pathname === '') return '';
  return pathname.replace(/\/$/, '');
}

/** Prefixes a path segment with the provided base path. */
export function withBase(path: string, basePath: string): string {
  return `${basePath}${path}`;
}
