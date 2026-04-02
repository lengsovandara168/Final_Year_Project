/**
 * Normalize search query by removing all spaces
 * This makes "pro max" match "promax", "Apple Pro Max", etc.
 */
export function normalizeSearchQuery(query: string): string {
  return query.toLowerCase().replace(/\s+/g, "");
}

/**
 * Check if a value matches a normalized query
 */
export function matchesNormalizedQuery(
  value: string,
  normalizedQuery: string,
): boolean {
  const normalizedValue = normalizeSearchQuery(value);
  return normalizedValue.includes(normalizedQuery);
}

/**
 * Deduplicate search results by ID
 */
export function deduplicateResults<T extends { id: string }>(
  results: T[],
): T[] {
  const seen = new Set<string>();
  return results.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}
