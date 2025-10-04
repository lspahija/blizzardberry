'use client';

import { useState } from 'react';

export default function ProxyPage() {
  const [url, setUrl] = useState('');
  const [encodedUrl, setEncodedUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:8080/api/encode', {
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
      <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', gap: '10px' }}>
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
      {encodedUrl && (
        <iframe
          src={encodedUrl}
          style={{
            width: '100%',
            height: 'calc(100vh - 70px)',
            border: 'none',
          }}
        />
      )}
    </div>
  );
}
