import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const targetUrl = searchParams.get('url')

  if (!targetUrl) {
    return new NextResponse('URL parameter is required', { status: 400 })
  }

  try {
    // Validate URL
    const url = new URL(targetUrl)
    if (!['http:', 'https:'].includes(url.protocol)) {
      return new NextResponse('Invalid URL protocol', { status: 400 })
    }

    // Fetch the target website
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BlizzardBerry-Proxy/1.0)',
      },
    })

    if (!response.ok) {
      return new NextResponse(`Failed to fetch: ${response.statusText}`, { 
        status: response.status 
      })
    }

    const contentType = response.headers.get('content-type') || ''
    
    // Only process HTML content
    if (!contentType.includes('text/html')) {
      // For non-HTML content, just proxy it through
      return new NextResponse(response.body, {
        status: response.status,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'no-cache',
        },
      })
    }

    let html = await response.text()

    // Get the current host for widget script URL
    const host = request.headers.get('host')
    const protocol = request.headers.get('x-forwarded-proto') || 'http'
    const baseUrl = `${protocol}://${host}`

    // Widget configuration and injection scripts
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
                company: "Proxy Test"
            }
        };
    </script>

    <script id="blizzardberry-actions" type="text/javascript">
        window.agentActions = {
            testAction: async (params, userConfig) => {
                console.log('Proxy test action called with:', params, userConfig);
                return { 
                    status: 'success', 
                    message: 'Proxy test action executed successfully',
                    timestamp: new Date().toISOString()
                };
            },
            
            getPageInfo: async (userConfig) => {
                return {
                    status: 'success',
                    data: {
                        title: document.title,
                        url: window.location.href,
                        domain: window.location.hostname
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
        data-agent-id="8b5d8bfb-f6b4-45de-9500-aa95c7046487"
    ></script>
    `

    // Inject the widget scripts before closing </body> tag
    if (html.includes('</body>')) {
      html = html.replace('</body>', `${widgetInjection}\n</body>`)
    } else if (html.includes('</html>')) {
      // Fallback: inject before closing </html> tag if no </body>
      html = html.replace('</html>', `${widgetInjection}\n</html>`)
    } else {
      // Last resort: append to end of content
      html += widgetInjection
    }

    // Fix relative URLs to point to the original domain
    const originalDomain = url.origin
    
    // Fix relative links, images, scripts, and stylesheets
    html = html
      .replace(/href="(?!https?:\/\/|\/\/|#)([^"]+)"/g, `href="${originalDomain}/$1"`)
      .replace(/src="(?!https?:\/\/|\/\/|data:)([^"]+)"/g, `src="${originalDomain}/$1"`)
      .replace(/action="(?!https?:\/\/|\/\/|#)([^"]+)"/g, `action="${originalDomain}/$1"`)

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache',
        'X-Frame-Options': 'SAMEORIGIN',
      },
    })

  } catch (error) {
    console.error('Proxy error:', error)
    return new NextResponse(
      `Error proxying URL: ${error instanceof Error ? error.message : 'Unknown error'}`, 
      { status: 500 }
    )
  }
}