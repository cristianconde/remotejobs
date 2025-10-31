import { TAG_NORMALIZATIONS } from './constants';

/**
 * Normalizes a single tag by:
 * - Converting to lowercase
 * - Removing " programming" suffix
 * - Unifying variations (backend/back-end, frontend/front-end, fullstack/full-stack)
 */
export function normalizeTag(tag: string): string {
  if (!tag) return '';

  // Convert to lowercase
  let normalized = tag.toLowerCase();

  // Remove " programming" suffix
  normalized = normalized.replace(/\s+programming$/i, '');

  // Apply normalization rules
  for (const [targetTag, pattern] of Object.entries(TAG_NORMALIZATIONS)) {
    if (normalized.includes(targetTag.replace(/stack/, ' stack').replace(/end/, ' end')) ||
        normalized.match(pattern)) {
      normalized = normalized.replace(pattern, targetTag);
    }
  }

  return normalized.trim();
}

/**
 * Normalizes an array of tags
 */
export function normalizeTags(tags: string[]): string[] {
  return tags
    .filter(Boolean)
    .map(normalizeTag)
    .filter(Boolean);
}
