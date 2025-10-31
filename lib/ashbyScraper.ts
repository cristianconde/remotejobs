import * as cheerio from 'cheerio';
import { JobPost } from './types';

/**
 * Scrapes job posts from Ashby job boards
 */
export async function scrapeAshbyJobs(url: string, sourceName: string): Promise<JobPost[]> {
  try {
    console.log(`Scraping ${sourceName} from ${url}...`);
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; JobPostsBot/1.0)',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    console.log(`${sourceName}: Received HTML, length: ${html.length}`);

    // Try to find JSON data in various script tags
    // Pattern 1: window.__appData (used by Ashby)
    // Try multiple patterns for __appData
    let appDataMatch = html.match(/window\.__appData\s*=\s*({.+?})\s*;?\s*$/m);

    if (!appDataMatch) {
      // Try without the semicolon constraint
      appDataMatch = html.match(/window\.__appData\s*=\s*({[\s\S]+?})\s*<\/script>/);
    }

    if (!appDataMatch) {
      // Try finding it anywhere in script tags
      const scriptMatches = html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi);
      for (const match of scriptMatches) {
        const scriptContent = match[1];
        if (scriptContent.includes('window.__appData')) {
          const dataMatch = scriptContent.match(/window\.__appData\s*=\s*({[\s\S]+)/);
          if (dataMatch) {
            // Find the end of the JSON object
            let bracketCount = 0;
            let endIndex = 0;
            for (let i = 0; i < dataMatch[1].length; i++) {
              if (dataMatch[1][i] === '{') bracketCount++;
              if (dataMatch[1][i] === '}') bracketCount--;
              if (bracketCount === 0) {
                endIndex = i + 1;
                break;
              }
            }
            if (endIndex > 0) {
              appDataMatch = [dataMatch[0], dataMatch[1].substring(0, endIndex)];
              break;
            }
          }
        }
      }
    }

    if (appDataMatch) {
      console.log(`${sourceName}: Found window.__appData`);
      try {
        const data = JSON.parse(appDataMatch[1]);
        const jobs = extractJobsFromAppData(data, url, sourceName);
        console.log(`${sourceName}: Extracted ${jobs.length} jobs from __appData`);
        if (jobs.length > 0) {
          return jobs;
        }
      } catch (e) {
        console.log(`${sourceName}: Could not parse __appData:`, e);
      }
    }

    // Pattern 2: __NEXT_DATA__
    let nextDataMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>(.+?)<\/script>/s);

    if (nextDataMatch) {
      console.log(`${sourceName}: Found __NEXT_DATA__`);
      try {
        const data = JSON.parse(nextDataMatch[1]);
        const jobs = extractJobsFromNextData(data, url, sourceName);
        console.log(`${sourceName}: Extracted ${jobs.length} jobs from Next.js data`);
        if (jobs.length > 0) {
          return jobs;
        }
      } catch (e) {
        console.log(`${sourceName}: Could not parse Next.js data`);
      }
    }

    // Pattern 3: Any script tag with JSON-looking content
    const scriptMatches = html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi);
    for (const match of scriptMatches) {
      const scriptContent = match[1];
      // Look for objects that might contain job postings
      if (scriptContent.includes('"jobPostings"') || scriptContent.includes('"jobs"')) {
        try {
          // Try to extract JSON
          const jsonMatch = scriptContent.match(/(\{[\s\S]*\})/);
          if (jsonMatch) {
            const data = JSON.parse(jsonMatch[1]);
            const jobs = extractJobsFromNextData(data, url, sourceName);
            if (jobs.length > 0) {
              console.log(`${sourceName}: Found ${jobs.length} jobs in script tag`);
              return jobs;
            }
          }
        } catch (e) {
          // Continue searching
        }
      }
    }

    console.log(`${sourceName}: No structured data found, using regex extraction`);

    // Try regex-based extraction as fallback (more reliable for malformed HTML)
    const jobs = extractJobsWithRegex(html, url, sourceName);
    console.log(`${sourceName}: Extracted ${jobs.length} jobs via regex`);
    return jobs;
  } catch (error) {
    console.error(`Error scraping ${sourceName}:`, error);
    return [];
  }
}

/**
 * Extracts jobs from Ashby's window.__appData structure
 */
function extractJobsFromAppData(data: any, baseUrl: string, sourceName: string): JobPost[] {
  const jobs: JobPost[] = [];

  try {
    // Ashby stores jobs in __appData.jobBoard.jobPostings
    const jobPostings = data?.jobBoard?.jobPostings;

    if (Array.isArray(jobPostings)) {
      jobPostings.forEach((job: any) => {
        const title = job.title;
        const id = job.id;

        if (title && id) {
          const categories = [];
          if (job.departmentName) categories.push(job.departmentName);
          if (job.locationName) categories.push(job.locationName);
          if (job.workplaceType) categories.push(job.workplaceType);

          jobs.push({
            title,
            link: `${baseUrl.split('?')[0]}/${id}`,
            source: sourceName,
            categories: categories.length > 0 ? categories : undefined,
            pubDate: job.publishedDate || new Date().toISOString(),
          });
        }
      });
    }
  } catch (e) {
    console.error(`${sourceName}: Error parsing __appData:`, e);
  }

  return jobs;
}

/**
 * Extracts jobs from Next.js __NEXT_DATA__
 */
function extractJobsFromNextData(data: any, baseUrl: string, sourceName: string): JobPost[] {
  const jobs: JobPost[] = [];

  try {
    // Navigate through the data structure to find job postings
    // This structure may vary, so we'll try common patterns
    const pageProps = data?.props?.pageProps;

    if (pageProps) {
      // Look for job listings in various possible locations
      const jobsArray = pageProps.jobs || pageProps.jobPostings || pageProps.positions || [];

      jobsArray.forEach((job: any) => {
        const title = job.title || job.name || job.position;
        const id = job.id || job.jobId;

        if (title && id) {
          jobs.push({
            title,
            link: `${baseUrl.split('?')[0]}/${id}`,
            source: sourceName,
            categories: job.departments || job.tags || job.categories || undefined,
            pubDate: job.publishedAt || job.createdAt || new Date().toISOString(),
          });
        }
      });
    }
  } catch (e) {
    // Silently fail if data structure doesn't match
  }

  return jobs;
}

/**
 * Extracts jobs using regex (fallback for when HTML parsing fails)
 */
function extractJobsWithRegex(html: string, baseUrl: string, sourceName: string): JobPost[] {
  const jobs: JobPost[] = [];

  try {
    // Try multiple patterns to capture job links
    const patterns = [
      // Pattern 1: Standard href with /jobs/ path
      /<a[^>]+href=["']([^"']*\/jobs\/[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi,
      // Pattern 2: Ashby-specific patterns with job IDs
      /<a[^>]+href=["']([^"']*)["'][^>]*data-job[^>]*>([\s\S]*?)<\/a>/gi,
      // Pattern 3: Any link containing job-related text
      /<a[^>]+href=["']([^"']+)["'][^>]*class="[^"]*job[^"]*"[^>]*>([\s\S]*?)<\/a>/gi,
    ];

    for (const linkPattern of patterns) {
      let match;
      while ((match = linkPattern.exec(html)) !== null) {
        const href = match[1];
        const content = match[2];

        // Extract title from link content (remove HTML tags)
        const title = content.replace(/<[^>]+>/g, '').trim();

        // Validate that this looks like a job posting
        if (title && href && title.length > 3 && title.length < 200 &&
            !href.includes('#') && !href.startsWith('javascript:')) {
          try {
            const link = href.startsWith('http')
              ? href
              : new URL(href, baseUrl).toString();

            jobs.push({
              title,
              link,
              source: sourceName,
              pubDate: new Date().toISOString(),
            });
          } catch (e) {
            // Skip invalid URLs
          }
        }
      }
    }

    console.log(`${sourceName}: Regex found ${jobs.length} jobs before deduplication`);

    // Remove duplicates based on link
    const uniqueJobs = Array.from(
      new Map(jobs.map(job => [job.link, job])).values()
    );

    return uniqueJobs;
  } catch (e) {
    console.error(`${sourceName}: Regex extraction error:`, e);
    return [];
  }
}
