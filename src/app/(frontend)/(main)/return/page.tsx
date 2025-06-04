'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface SessionStatus {
  status: string;
  customer_email: string | null;
}

export default function ReturnPage() {
  const [status, setStatus] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      fetch(`/api/stripe/session-status?session_id=${sessionId}`)
        .then((res) => res.json())
        .then((data: SessionStatus) => {
          setStatus(data.status);
          if (data.status === 'complete') {
            setTimeout(() => router.push('/'), 3000);
          }
        })
        .catch((err) => {
          console.error('Error fetching session status:', err);
          setStatus('error');
        });
    }
  }, [searchParams, router]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Payment Status</h1>
      {status === 'complete' && (
        <p className="text-green-600">
          Payment successful! Redirecting to dashboard...
        </p>
      )}
      {status === 'open' && (
        <p className="text-red-600">
          Payment failed or was canceled. Please try again.
        </p>
      )}
      {status === 'error' && (
        <p className="text-red-600">
          An error occurred. Please try again or contact support.
        </p>
      )}
      {!status && <p>Loading...</p>}
    </div>
  );
}
