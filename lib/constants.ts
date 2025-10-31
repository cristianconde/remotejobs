// Filter configuration
export const FILTER_KEYWORDS = {
  frontend: ['frontend', 'front-end', 'front end'],
  backend: ['backend', 'back-end', 'back end'],
  fullstack: ['fullstack', 'full-stack', 'full stack'],
} as const;

export type FilterKey = keyof typeof FILTER_KEYWORDS;

// Tag normalization rules
export const TAG_NORMALIZATIONS: Record<string, RegExp> = {
  backend: /back[\s-]end/gi,
  frontend: /front[\s-]end/gi,
  fullstack: /full[\s-]stack/gi,
};

// Feed sources
export const FEED_SOURCES = {
  WE_WORK_REMOTELY: 'We Work Remotely',
  REMOTE_OK: 'Remote OK',
} as const;

// Revalidation time (5 minutes)
export const REVALIDATE_SECONDS = 300;
