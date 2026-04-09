export function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

export function matchesSearch(source: string | string[], query: string) {
  if (!query.trim()) {
    return true;
  }

  const normalizedQuery = normalizeText(query);
  const haystack = Array.isArray(source) ? source.join(' ') : source;

  return normalizeText(haystack).includes(normalizedQuery);
}
