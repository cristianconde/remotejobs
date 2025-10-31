import Parser from "rss-parser";
import { JobPost, Feed, RSSItem } from "./types";
import { FEED_SOURCES } from "./constants";
import { extractCategories } from "./categoryExtractor";
import { normalizeTags } from "./tagNormalizer";

export const FEEDS: Feed[] = [
  {
    url: "https://weworkremotely.com/categories/remote-programming-jobs.rss",
    source: FEED_SOURCES.WE_WORK_REMOTELY,
  },
  {
    url: "https://remoteok.com/rss",
    source: FEED_SOURCES.REMOTE_OK,
  },
];

// Singleton parser instance
const parser = new Parser({
  customFields: {
    item: ['tags', 'tag']
  }
});

/**
 * Transforms an RSS item into a JobPost
 */
function transformRSSItemToJobPost(item: RSSItem, feedSource: string): JobPost {
  const categories = extractCategories(item, feedSource);
  const normalizedCategories = normalizeTags(categories);

  return {
    title: item.title || "No title",
    link: item.link || "#",
    pubDate: item.pubDate,
    source: feedSource,
    categories: normalizedCategories,
  };
}

/**
 * Fetches and parses job posts from a single RSS feed
 */
export async function getJobPosts(feed: Feed): Promise<JobPost[]> {
  try {
    const parsedFeed = await parser.parseURL(feed.url);
    return parsedFeed.items.map((item: RSSItem) =>
      transformRSSItemToJobPost(item, feed.source)
    );
  } catch (error) {
    console.error(`Error fetching ${feed.source}:`, error);
    return [];
  }
}
