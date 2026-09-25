/** Resolves files in public/ correctly on both the domain root and GitHub Pages project paths. */
export function assetPath(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;
}
