/**
 * Génère l'URL canonique d'une fiche réparateur.
 * Pattern : /reparateur/:city/:repairerSlug
 */
export function slugifyForUrl(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function repairerUrl(input: { city?: string | null; name?: string | null; business_name?: string | null }): string {
  const city = input.city ?? '';
  const name = input.business_name ?? input.name ?? '';
  if (!city || !name) return '/search';
  return `/reparateur/${slugifyForUrl(city)}/${slugifyForUrl(name)}`;
}
