'use client';

import { useState } from 'react';

export default function ProxyPage() {
  const [url, setUrl] = useState('');
  const [encodedUrl, setEncodedUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:1337/api/encode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();
      setEncodedUrl(data.proxyUrl);
    } catch (error) {
      console.error('Failed to encode URL:', error);
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
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
        <iframe
          src={encodedUrl}
          style={{
            width: '100%',
            height: '100vh',
            border: 'none',
          }}
        />
      )}
    </div>
  );
}
