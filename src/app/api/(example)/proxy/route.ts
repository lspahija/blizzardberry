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

    // Enhanced fetch with better headers for Google
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Upgrade-Insecure-Requests': '1',
      },
    });

    if (!response.ok) {
      return new NextResponse(`Failed to fetch: ${response.statusText}`, {
        status: response.status,
      });
    }

    const contentType = response.headers.get('content-type') || '';

    // For non-HTML content, create a proxy URL
    if (!contentType.includes('text/html')) {
      const host = request.headers.get('host');
      const protocol = request.headers.get('x-forwarded-proto') || 'http';
      const proxyUrl = `${protocol}://${host}/api/proxy-resource?url=${encodeURIComponent(targetUrl)}`;
      
      return new NextResponse(response.body, {
        status: response.status,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=3600',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    let html = await response.text();

    // Get the current host for widget script URL
    const host = request.headers.get('host');
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const baseUrl = `${protocol}://${host}`;
    const originalDomain = url.origin;

    // FIRST: Inject widget before any URL rewriting to ensure it's always present
    const widgetInjection = `
    <!-- BlizzardBerry Widget Injection -->
    <script id="blizzardberry-debug" type="text/javascript">
        console.log('BlizzardBerry proxy: Starting widget injection for:', window.location.href);
        console.log('BlizzardBerry proxy: Base URL:', '${baseUrl}');
    </script>
    
    <script id="blizzardberry-navigation-interceptor" type="text/javascript">
        // Intercept navigation to keep it within the proxy
        (function() {
            const proxyBase = '${baseUrl}/api/proxy?url=';
            const originalDomain = '${originalDomain}';
            
            // Intercept click events on links
            document.addEventListener('click', function(e) {
                const link = e.target.closest('a');
                if (link) {
                    const href = link.getAttribute('href');
                    console.log('Link clicked:', href, 'Current domain:', originalDomain);
                    
                    if (href && !href.startsWith('${baseUrl}/api/proxy') && 
                        !href.startsWith('mailto:') && !href.startsWith('tel:') && 
                        !href.startsWith('javascript:') && !href.startsWith('#') &&
                        href !== '') {
                        
                        let fullUrl;
                        if (href.startsWith('http')) {
                            // Already absolute URL - only intercept same domain
                            if (href.startsWith(originalDomain)) {
                                fullUrl = href;
                            } else {
                                console.log('External link, allowing normal navigation');
                                return; // External link, let it navigate normally
                            }
                        } else if (href.startsWith('/')) {
                            fullUrl = originalDomain + href;
                        } else if (!href.startsWith('#')) {
                            // Relative URL
                            const currentPath = window.location.pathname;
                            const basePath = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
                            fullUrl = originalDomain + basePath + href;
                        } else {
                            return; // Hash link, let it work normally
                        }
                        
                        console.log('Intercepting navigation to:', fullUrl);
                        e.preventDefault();
                        e.stopPropagation();
                        const proxyUrl = proxyBase + encodeURIComponent(fullUrl);
                        console.log('Redirecting to proxy URL:', proxyUrl);
                        window.location.href = proxyUrl;
                    }
                }
            }, true);
            
            console.log('BlizzardBerry navigation interceptor loaded');
        })();
    </script>
    
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
        console.log('BlizzardBerry proxy config loaded:', window.agentUserConfig);
    </script>

    <script id="blizzardberry-actions" type="text/javascript">
        window.agentActions = {
            testAction: async (params, userConfig) => {
                console.log('Proxy test action called with:', params, userConfig);
                return { 
                    status: 'success', 
                    message: 'Proxy test action executed successfully',
                    timestamp: new Date().toISOString(),
                    proxyInfo: {
                        originalUrl: '${targetUrl}',
                        proxyUrl: window.location.href
                    }
                };
            },
            
            getPageInfo: async (userConfig) => {
                return {
                    status: 'success',
                    data: {
                        title: document.title,
                        url: window.location.href,
                        domain: window.location.hostname,
                        originalUrl: '${targetUrl}',
                        userAgent: navigator.userAgent
                    }
                };
            },
            
            debugProxy: async (userConfig) => {
                return {
                    status: 'success',
                    data: {
                        proxyMode: true,
                        originalUrl: '${targetUrl}',
                        currentUrl: window.location.href,
                        agentScript: '${baseUrl}/agent/agent.js',
                        userConfig: userConfig,
                        timestamp: new Date().toISOString()
                    }
                };
            }
        };
        console.log('BlizzardBerry proxy actions loaded:', window.agentActions);
    </script>

    <script
        id="blizzardberry-agent"
        src="${baseUrl}/agent/agent.js"
        type="text/javascript"
        data-agent-id="f452cd58-23aa-4a6c-87d0-e68fb7384c73"
        onload="console.log('BlizzardBerry widget script loaded successfully')"
        onerror="console.error('BlizzardBerry widget script failed to load')"
    ></script>
    
    <script id="blizzardberry-proxy-ready" type="text/javascript">
        console.log('BlizzardBerry proxy: Widget injection complete');
    </script>
    `;

    // Inject the widget scripts before closing </body> tag
    console.log('Injecting widget for URL:', targetUrl);
    if (html.includes('</body>')) {
      html = html.replace('</body>', `${widgetInjection}\n</body>`);
      console.log('Widget injected before </body> tag');
    } else if (html.includes('</html>')) {
      // Fallback: inject before closing </html> tag if no </body>
      html = html.replace('</html>', `${widgetInjection}\n</html>`);
      console.log('Widget injected before </html> tag');
    } else {
      // Last resort: append to end of content
      html += widgetInjection;
      console.log('Widget appended to end of content');
    }

    // Enhanced URL rewriting to proxy all resources
    const proxyResourceUrl = `${baseUrl}/api/proxy-resource?url=`;
    
    // Rewrite all URLs to go through proxy
    html = html
      // Fix absolute URLs to the same domain
      .replace(
        new RegExp(`href=["']${originalDomain.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^"']*)["']`, 'gi'),
        (match, path) => `href="${baseUrl}/api/proxy?url=${encodeURIComponent(originalDomain + path)}"`
      )
      // Fix relative and absolute links to proxy through main proxy
      .replace(
        /href=["'](?!https?:\/\/|\/\/|#|mailto:|tel:|javascript:|data:)([^"']+)["']/gi,
        (match, url) => {
          const fullUrl = url.startsWith('/') ? `${originalDomain}${url}` : `${originalDomain}/${url}`;
          return `href="${baseUrl}/api/proxy?url=${encodeURIComponent(fullUrl)}"`;
        }
      )
      // Fix images, scripts, CSS through resource proxy
      .replace(
        /src=["'](?!https?:\/\/|\/\/|data:|javascript:)([^"']+)["']/gi,
        (match, url) => {
          const fullUrl = url.startsWith('/') ? `${originalDomain}${url}` : `${originalDomain}/${url}`;
          return `src="${proxyResourceUrl}${encodeURIComponent(fullUrl)}"`;
        }
      )
      // Fix CSS imports
      .replace(
        /@import\s+["'](?!https?:\/\/)([^"']+)["']/gi,
        (match, url) => {
          const fullUrl = url.startsWith('/') ? `${originalDomain}${url}` : `${originalDomain}/${url}`;
          return `@import "${proxyResourceUrl}${encodeURIComponent(fullUrl)}"`;
        }
      )
      // Fix CSS url() references
      .replace(
        /url\(["']?(?!https?:\/\/|data:|#)([^)"']+)["']?\)/gi,
        (match, url) => {
          const fullUrl = url.startsWith('/') ? `${originalDomain}${url}` : `${originalDomain}/${url}`;
          return `url("${proxyResourceUrl}${encodeURIComponent(fullUrl)}")`;
        }
      )
      // Fix form actions
      .replace(
        /action=["'](?!https?:\/\/|\/\/|#)([^"']+)["']/gi,
        (match, url) => {
          const fullUrl = url.startsWith('/') ? `${originalDomain}${url}` : `${originalDomain}/${url}`;
          return `action="${baseUrl}/api/proxy?url=${encodeURIComponent(fullUrl)}"`;
        }
      );

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache',
        'X-Frame-Options': 'SAMEORIGIN',
        // Remove restrictive headers that might block widget loading
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
