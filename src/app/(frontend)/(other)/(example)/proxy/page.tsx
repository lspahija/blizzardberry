'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { X } from 'lucide-react';

export default function ProxyPage() {
  const [url, setUrl] = useState('');
  const [encodedUrl, setEncodedUrl] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // Check if URL is provided in query params
    const urlParam = searchParams.get('url');
    if (urlParam) {
      setEncodedUrl(decodeURIComponent(urlParam));
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Add https:// if no protocol is specified
    const normalizedUrl = url.match(/^https?:\/\//) ? url : `https://${url}`;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BLIZZARDBERRY_MIRROR_BASE_URL}/api/encode`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: normalizedUrl }),
      });

      const data = await response.json();
      setEncodedUrl(data.proxyUrl);
    } catch (error) {
      console.error('Failed to encode URL:', error);
    }
  };

  const handleClose = () => {
    router.push('/');
  };

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {!encodedUrl ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', width: '80%', maxWidth: '600px' }}>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter URL"
              style={{ flex: 1, padding: '10px', fontSize: '16px' }}
            />
            <button type="submit" style={{ padding: '10px 20px', fontSize: '16px' }}>
              Load
            </button>
          </form>
        </div>
      ) : (
        <>
          <button
            onClick={handleClose}
            style={{
              position: 'fixed',
              top: '16px',
              right: '16px',
              zIndex: 9999,
              padding: '12px 20px',
              backgroundColor: 'white',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
          >
            <X size={16} />
            Close Demo
          </button>
          <iframe
            src={encodedUrl}
            style={{
              width: '100%',
              height: '100vh',
              border: 'none',
            }}
          />
        </>
      )}
    </div>
  );
}
