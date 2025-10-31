'use client';

import { useEffect } from 'react';
import { Card, CardHeader, CardDescription } from '@/components/ui/card';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <main className="w-full max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">
          Remote Programming Jobs
        </h1>
        <p className="text-muted-foreground mb-8">
          Latest remote job postings from We Work Remotely and Remote OK
        </p>

        <Card className="border-destructive">
          <CardHeader>
            <CardDescription className="text-center py-8">
              <div className="space-y-4">
                <p className="text-destructive font-medium">
                  Failed to load job postings
                </p>
                <p className="text-sm text-muted-foreground">
                  {error.message || 'An unexpected error occurred'}
                </p>
                <button
                  onClick={reset}
                  className="px-4 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </CardDescription>
          </CardHeader>
        </Card>
      </main>
    </div>
  );
}
