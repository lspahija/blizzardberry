const http = require('http');

const server = http.createServer((req, res) => {
    // Set the host header to blizzardberry.com
    req.headers.host = 'blizzardberry.com';
    
    // Create a proxy request to localhost:3000
    const proxyReq = http.request({
        hostname: 'localhost',
        port: 3000,
        path: req.url,
        method: req.method,
        headers: req.headers
    }, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
    });
    
    req.pipe(proxyReq);
    
    proxyReq.on('error', (err) => {
        console.error('Proxy error:', err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Proxy error');
    });
});

const PORT = 8080;
server.listen(PORT, () => {
    console.log(`HTTP proxy server running on port ${PORT}`);
    console.log(`Visit: http://blizzardberry.com:${PORT}`);
});
