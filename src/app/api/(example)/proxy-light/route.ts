import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return new NextResponse('URL parameter is required', { status: 400 });
  }

  try {
    const url = new URL(targetUrl);
    if (!['http:', 'https:'].includes(url.protocol)) {
      return new NextResponse('Invalid URL protocol', { status: 400 });
    }

    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Referer': url.origin,
      },
    });

    if (!response.ok) {
      return new NextResponse(`Failed to fetch: ${response.statusText}`, {
        status: response.status,
      });
    }

    const contentType = response.headers.get('content-type') || '';

    // For non-HTML content, proxy directly
    if (!contentType.includes('text/html')) {
      return new NextResponse(response.body, {
        status: response.status,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'no-cache',
        },
      });
    }

    let html = await response.text();
    const host = request.headers.get('host');
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const baseUrl = `${protocol}://${host}`;

    // Enhanced URL rewriting - handles more cases
    const originalDomain = url.origin;
    const proxyPrefix = `${baseUrl}/api/proxy?url=`;
    
    // Fix all resource URLs to go through proxy
    html = html
      // Fix relative and absolute links
      .replace(
        /href=["'](?!https?:\/\/|\/\/|#|mailto:|tel:|data:)([^"']+)["']/gi,
        `href="${proxyPrefix}${encodeURIComponent(originalDomain + '/$1')}"`
      )
      // Fix scripts and images
      .replace(
        /src=["'](?!https?:\/\/|\/\/|data:)([^"']+)["']/gi,
        `src="${proxyPrefix}${encodeURIComponent(originalDomain + '/$1')}"`
      )
      // Fix form actions
      .replace(
        /action=["'](?!https?:\/\/|\/\/|#)([^"']+)["']/gi,
        `action="${proxyPrefix}${encodeURIComponent(originalDomain + '/$1')}"`
      )
      // Fix CSS @import and url() references
      .replace(
        /@import\s+["'](?!https?:\/\/)([^"']+)["']/gi,
        `@import "${proxyPrefix}${encodeURIComponent(originalDomain + '/$1')}"`
      )
      .replace(
        /url\(["']?(?!https?:\/\/|data:)([^)"']+)["']?\)/gi,
        `url("${proxyPrefix}${encodeURIComponent(originalDomain + '/$1')}")`
      );

    // Add widget injection
    const widgetInjection = `
    <!-- BlizzardBerry Widget Injection -->
    <script id="blizzardberry-config" type="text/javascript">
        window.agentUserConfig = {
            userId: "proxy_user_" + Date.now(),
            userHash: "proxy_hash_" + Math.random().toString(36).substr(2, 9),
            accountNumber: "0000000000",
            userMetadata: {
                name: "Proxy User",
                email: "proxy@example.com",
                company: "Proxy Test",
                originalUrl: "${targetUrl}",
                proxyMode: true
            }
        };
    </script>
    
    <script id="blizzardberry-agent" src="${baseUrl}/agent/agent.js" type="text/javascript" data-agent-id="f452cd58-23aa-4a6c-87d0-e68fb7384c73"></script>
    `;

    if (html.includes('</body>')) {
      html = html.replace('</body>', `${widgetInjection}\n</body>`);
    } else if (html.includes('</html>')) {
      html = html.replace('</html>', `${widgetInjection}\n</html>`);
    } else {
      html += widgetInjection;
    }

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache',
        'X-Frame-Options': 'SAMEORIGIN',
        'Content-Security-Policy': 'default-src * \'unsafe-inline\' \'unsafe-eval\' data: blob:; script-src * \'unsafe-inline\' \'unsafe-eval\'; style-src * \'unsafe-inline\';',
      },
    });

  } catch (error) {
    console.error('Proxy error:', error);
    return new NextResponse(
      `Error proxying URL: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { status: 500 }
    );
  }
}