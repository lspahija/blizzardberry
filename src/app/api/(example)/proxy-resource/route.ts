import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return new NextResponse('URL parameter is required', { status: 400 });
  }

  try {
    // Validate URL
    const url = new URL(targetUrl);
    if (!['http:', 'https:'].includes(url.protocol)) {
      return new NextResponse('Invalid URL protocol', { status: 400 });
    }

    // Fetch the resource with appropriate headers
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Referer': url.origin,
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'cross-site',
      },
    });

    if (!response.ok) {
      return new NextResponse(`Failed to fetch resource: ${response.statusText}`, {
        status: response.status,
      });
    }

    // Get content type and handle CSS specifically
    const contentType = response.headers.get('content-type') || '';
    
    if (contentType.includes('text/css')) {
      // Process CSS to fix relative URLs
      let css = await response.text();
      const originalDomain = url.origin;
      const host = request.headers.get('host');
      const protocol = request.headers.get('x-forwarded-proto') || 'http';
      const proxyResourceUrl = `${protocol}://${host}/api/proxy-resource?url=`;

      // Fix @import statements
      css = css.replace(
        /@import\s+["'](?!https?:\/\/)([^"']+)["']/gi,
        (match, importUrl) => {
          const fullUrl = importUrl.startsWith('/') ? `${originalDomain}${importUrl}` : `${originalDomain}/${importUrl}`;
          return `@import "${proxyResourceUrl}${encodeURIComponent(fullUrl)}"`;
        }
      );

      // Fix url() references
      css = css.replace(
        /url\(["']?(?!https?:\/\/|data:|#)([^)"']+)["']?\)/gi,
        (match, cssUrl) => {
          const fullUrl = cssUrl.startsWith('/') ? `${originalDomain}${cssUrl}` : `${originalDomain}/${cssUrl}`;
          return `url("${proxyResourceUrl}${encodeURIComponent(fullUrl)}")`;
        }
      );

      return new NextResponse(css, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=3600',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // For all other resources (images, JS, etc.), proxy as-is
    return new NextResponse(response.body, {
      status: response.status,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('Resource proxy error:', error);
    return new NextResponse(
      `Error proxying resource: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { status: 500 }
    );
  }
}