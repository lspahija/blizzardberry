'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/app/(frontend)/components/ui/button';
import { Navbar } from '@/app/(frontend)/components/Navbar';

export default function UsagePage() {
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/credits')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch credits');
        return res.json();
      })
      .then((data) => {
        setCredits(data.credits);
        setLoading(false);
      })
      .catch((err) => {
        setError('Could not load credits. Please try again.');
        setLoading(false);
      });
  }, []);

  return (
    <>
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 mt-6 sm:mt-12">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-6 sm:mb-8 text-foreground">
          Your Usage
        </h1>
        <div className="bg-card border-4 border-brand rounded-2xl shadow-lg p-4 sm:p-8 flex flex-col items-start">
          <div className="text-xl sm:text-2xl font-bold mb-2 text-foreground">
            Credits
          </div>
          <div className="text-4xl sm:text-5xl font-extrabold text-brand mb-2">
            {loading ? '...' : credits}
          </div>
          <div className="text-sm sm:text-base text-muted-foreground">
            {loading ? 'Loading your credits...' : error}
          </div>
          <div className="text-sm sm:text-base text-muted-foreground mt-4 sm:mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-0">
            <span>Would you like to buy more credits?</span>
            <Button
              asChild
              className="bg-brand text-primary-foreground border-[3px] border-border transition-all duration-200 text-sm sm:text-base font-semibold px-4 sm:px-6 py-2 rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:-translate-x-0.5 hover:bg-brand/90 sm:ml-3 w-full sm:w-auto"
            >
              <Link
                href="/pricing#buy-credits"
                className="flex items-center justify-center"
              >
                Buy Credits
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
