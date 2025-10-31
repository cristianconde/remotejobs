'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tag, Briefcase } from 'lucide-react';
import { JobPost } from '@/lib/types';
import { FilterType, filterJobPosts, calculateFilterCounts } from '@/lib/jobPostFilters';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface JobPostsListProps {
  posts: JobPost[];
}

const POSTS_PER_PAGE = 20;

export function JobPostsList({ posts }: JobPostsListProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate counts for each filter
  const counts = useMemo(() => calculateFilterCounts(posts), [posts]);

  // Filter posts based on active filter
  const filteredPosts = useMemo(() =>
    filterJobPosts(posts, activeFilter),
    [posts, activeFilter]
  );

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'front-end', label: 'Front-End' },
    { key: 'back-end', label: 'Back-End' },
    { key: 'full-stack', label: 'Full-Stack' },
  ];

  return (
    <>
      {/* Filter Header */}
      <div className="mb-6 flex items-center gap-4 flex-wrap">
        <span className="text-sm text-muted-foreground">
          {filteredPosts.length > 0 ? (
            <>
              Showing {startIndex + 1}-{Math.min(endIndex, filteredPosts.length)} of {filteredPosts.length} {filteredPosts.length === 1 ? 'result' : 'results'}
            </>
          ) : (
            '0 results'
          )}
        </span>
        <div className="flex gap-2">
          {filters.map(filter => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeFilter === filter.key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {filter.label} ({counts[filter.key]})
            </button>
          ))}
        </div>
      </div>

      {/* Job Posts */}
      <div className="space-y-4">
        {paginatedPosts.map((post) => (
          <Card key={post.link} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>
                <a
                  href={post.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  {post.title}
                </a>
              </CardTitle>
              <CardDescription>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  <span className="font-medium">{post.source}</span>
                  {post.pubDate && (
                    <>
                      {' • '}
                      <span>{new Date(post.pubDate).toLocaleDateString()}</span>
                    </>
                  )}
                </div>
              </CardDescription>
            </CardHeader>
            {post.categories && Array.isArray(post.categories) && post.categories.length > 0 && (
              <CardContent>
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  {post.categories.map((category, catIndex) => (
                    <Badge key={catIndex} variant="secondary">
                      {category}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <Card>
          <CardHeader>
            <CardDescription className="text-center py-8">
              No job posts available for this filter.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) setCurrentPage(currentPage - 1);
                  }}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // Show first page, last page, current page, and pages around current
                const showPage =
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1);

                const showEllipsisBefore = page === currentPage - 2 && currentPage > 3;
                const showEllipsisAfter = page === currentPage + 2 && currentPage < totalPages - 2;

                return (
                  <span key={page}>
                    {showEllipsisBefore && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}
                    {showPage && (
                      <PaginationItem>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(page);
                          }}
                          isActive={currentPage === page}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    )}
                    {showEllipsisAfter && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}
                  </span>
                );
              })}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                  }}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </>
  );
}
