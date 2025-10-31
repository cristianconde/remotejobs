import { JobPost } from './types';
import { FILTER_KEYWORDS, FilterKey } from './constants';

export type FilterType = 'all' | 'front-end' | 'back-end' | 'full-stack';

/**
 * Checks if a job post matches any of the given keywords
 */
export function postMatchesKeywords(post: JobPost, keywords: string[]): boolean {
  const titleLower = post.title.toLowerCase();
  const categoriesText = post.categories?.join(' ').toLowerCase() || '';

  return keywords.some(keyword =>
    titleLower.includes(keyword) || categoriesText.includes(keyword)
  );
}

/**
 * Gets the keywords for a specific filter
 */
function getFilterKeywords(filter: FilterType): string[] {
  const filterMap: Record<FilterType, string[]> = {
    'all': [],
    'front-end': FILTER_KEYWORDS.frontend,
    'back-end': FILTER_KEYWORDS.backend,
    'full-stack': FILTER_KEYWORDS.fullstack,
  };

  return filterMap[filter] || [];
}

/**
 * Filters job posts based on the active filter
 */
export function filterJobPosts(posts: JobPost[], filter: FilterType): JobPost[] {
  if (filter === 'all') return posts;

  const keywords = getFilterKeywords(filter);
  return posts.filter(post => postMatchesKeywords(post, keywords));
}

/**
 * Calculates counts for each filter
 */
export function calculateFilterCounts(posts: JobPost[]): Record<string, number> {
  return {
    all: posts.length,
    'front-end': posts.filter(post =>
      postMatchesKeywords(post, FILTER_KEYWORDS.frontend)
    ).length,
    'back-end': posts.filter(post =>
      postMatchesKeywords(post, FILTER_KEYWORDS.backend)
    ).length,
    'full-stack': posts.filter(post =>
      postMatchesKeywords(post, FILTER_KEYWORDS.fullstack)
    ).length,
  };
}
