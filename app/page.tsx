import { getJobPosts, FEEDS } from '@/lib/jobPostsService';
import { JobPostsList } from '@/components/JobPostsList';
import { Footer } from '@/components/Footer';
import { Metadata } from 'next';

// Enable ISR - revalidate every 5 minutes
export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Remote Programming Jobs - Latest Opportunities',
  description: 'Find the latest remote programming jobs from We Work Remotely and Remote OK. Browse frontend, backend, and full-stack positions.',
};

export default async function Home() {
  // Fetch job posts from all feeds
  const allJobPostsPromises = FEEDS.map(feed => getJobPosts(feed));
  const allJobPostsArrays = await Promise.all(allJobPostsPromises);
  const allJobPosts = allJobPostsArrays.flat();

  // Sort by date, newest first (create new array to avoid mutation)
  const jobPosts = [...allJobPosts].sort((a, b) => {
    const dateA = a.pubDate ? new Date(a.pubDate).getTime() : 0;
    const dateB = b.pubDate ? new Date(b.pubDate).getTime() : 0;
    return dateB - dateA; // Descending order (newest first)
  });

  return (
    <div className="min-h-screen bg-background py-8 px-4 flex flex-col">
      <main className="w-full max-w-5xl mx-auto flex-1">
        <h1 className="text-4xl font-bold mb-2">
          Remote Programming Jobs
        </h1>
        <p className="text-muted-foreground mb-8">
          Latest remote job postings from We Work Remotely and Remote OK
        </p>

        <JobPostsList posts={jobPosts} />
      </main>

      <Footer />
    </div>
  );
}
