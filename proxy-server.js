const http = require('http');
const httpProxy = require('http-proxy');

// Create a proxy server
const proxy = httpProxy.createProxyServer({});

// Create the server
const server = http.createServer((req, res) => {
    // Set the host header to blizzardberry.com
    req.headers.host = 'blizzardberry.com';
    
    // Proxy to localhost:3000
    proxy.web(req, res, {
        target: 'http://localhost:3000'
    });
});

// Handle proxy errors
proxy.on('error', (err, req, res) => {
    console.error('Proxy error:', err);
    res.writeHead(500, {
        'Content-Type': 'text/plain'
    });
    res.end('Proxy error');
});

const PORT = 80;
server.listen(PORT, () => {
    console.log(`Proxy server running on port ${PORT}`);
    console.log('Make sure to run: sudo node proxy-server.js (to bind to port 80)');
    console.log('Or run on a different port and update your hosts file');
});
