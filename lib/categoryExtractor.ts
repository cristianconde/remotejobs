import { RSSItem } from './types';
import { FEED_SOURCES } from './constants';

/**
 * Extracts categories from We Work Remotely RSS items
 */
function extractWeWorkRemotelyCategories(item: RSSItem): string[] {
  const cats = item.categories || [];
  return Array.isArray(cats) ? cats : [cats];
}

/**
 * Extracts categories from Remote OK RSS items
 */
function extractRemoteOKCategories(item: RSSItem): string[] {
  const tags = item.tags || item.tag || '';

  // Handle string tags (comma-separated)
  if (typeof tags === 'string' && tags.length > 0) {
    return tags.split(',').map(t => t.trim()).filter(Boolean);
  }

  // Handle array tags
  if (Array.isArray(tags)) {
    return tags;
  }

  // Fallback: try to extract from content
  if (item.content) {
    const tagMatch = item.content.match(/<tags>(.*?)<\/tags>/);
    if (tagMatch) {
      return tagMatch[1].split(',').map(t => t.trim()).filter(Boolean);
    }
  }

  return [];
}

/**
 * Extracts categories from an RSS item based on the feed source
 */
export function extractCategories(item: RSSItem, feedSource: string): string[] {
  switch (feedSource) {
    case FEED_SOURCES.WE_WORK_REMOTELY:
      return extractWeWorkRemotelyCategories(item);
    case FEED_SOURCES.REMOTE_OK:
      return extractRemoteOKCategories(item);
    default:
      return [];
  }
}
