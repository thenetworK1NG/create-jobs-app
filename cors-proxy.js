const http = require('http');
const https = require('https');
const url = require('url');

const PORT = 8001;

// Simple CORS proxy server
const server = http.createServer((req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Extract target URL from query parameter
    const parsedUrl = url.parse(req.url, true);
    const targetUrl = parsedUrl.query.url;

    if (!targetUrl) {
        res.writeHead(400, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({error: 'Missing URL parameter. Use: /?url=https://your-api.com'}));
        return;
    }

    console.log(`Proxying request to: ${targetUrl}`);

    // Parse target URL
    const target = url.parse(targetUrl);
    const isHttps = target.protocol === 'https:';
    const httpModule = isHttps ? https : http;

    // Prepare request options
    const options = {
        hostname: target.hostname,
        port: target.port || (isHttps ? 443 : 80),
        path: target.path,
        method: req.method,
        headers: {}
    };

    // Copy headers from original request (except host)
    Object.keys(req.headers).forEach(key => {
        if (key.toLowerCase() !== 'host') {
            options.headers[key] = req.headers[key];
        }
    });

    // Make the proxied request
    const proxyReq = httpModule.request(options, (proxyRes) => {
        // Copy status code
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        
        // Pipe the response
        proxyRes.pipe(res);
    });

    // Handle errors
    proxyReq.on('error', (err) => {
        console.error('Proxy request error:', err);
        res.writeHead(500, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({error: 'Proxy request failed: ' + err.message}));
    });

    // Pipe the request body
    req.pipe(proxyReq);
});

server.listen(PORT, () => {
    console.log(`🚀 CORS Proxy Server running on http://localhost:${PORT}`);
    console.log(`📖 Usage: http://localhost:${PORT}/?url=https://your-api.com/endpoint`);
    console.log(`🛑 Press Ctrl+C to stop`);
});

// Handle server errors
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use. Try a different port or stop other servers.`);
    } else {
        console.error('❌ Server error:', err);
    }
});
