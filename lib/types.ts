export interface JobPost {
  title: string;
  link: string;
  pubDate?: string;
  source: string;
  categories?: string[];
}

export interface Feed {
  url: string;
  source: string;
}

export interface RSSItem {
  title?: string;
  link?: string;
  pubDate?: string;
  content?: string;
  contentSnippet?: string;
  guid?: string;
  categories?: string[];
  isoDate?: string;
  tags?: string | string[];
  tag?: string | string[];
}
