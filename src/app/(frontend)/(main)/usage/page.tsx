'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/app/(frontend)/components/ui/button';

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
    <div className="max-w-2xl mx-auto mt-12">
      <h1 className="text-4xl font-extrabold mb-8 text-foreground">
        Your Usage
      </h1>
      <div className="bg-card border-4 border-brand rounded-2xl shadow-lg p-8 flex flex-col items-start">
        <div className="text-2xl font-bold mb-2 text-foreground">Credits</div>
        <div className="text-5xl font-extrabold text-brand mb-2">
          {loading ? '...' : credits}
        </div>
        <div className="text-base text-muted-foreground">
          {loading
            ? 'Loading your credits...'
            : error
              ? error
              : `You have ${credits} credits available.`}
        </div>
        <div className="text-base text-muted-foreground mt-6 flex items-center">
          Would you like to buy more credits?
          <Button
            asChild
            className="bg-brand text-primary-foreground border-[3px] border-border transition-all duration-200 text-base font-semibold px-6 py-2 rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:-translate-x-0.5 hover:bg-brand/90 ml-3"
          >
            <Link href="/pricing" className="flex items-center">
              Buy Credits
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
