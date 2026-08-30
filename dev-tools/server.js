const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = 5500;

// Change this to your deployed backend URL
const TARGET = 'https://multi-tenant-file-and-amp.onrender.com';

// Serve tester.html and any other static files in this folder
app.use(express.static(__dirname));

// Proxy every /api/* request to the real backend — browser only ever sees localhost:5500,
// so no CORS headers are needed at all since it's same-origin from the browser's perspective
app.use(
    '/api',
    createProxyMiddleware({
        target: TARGET,
        changeOrigin: true,
        pathRewrite: { '^/api/v1': '/v1' }, // /api/v1/... -> /v1/... matching your real backend
        onProxyReq: (proxyReq, req) => {
            console.log(`[proxy] ${req.method} ${req.originalUrl} -> ${TARGET}${req.originalUrl.replace('/api/v1', '/v1')}`);
        },
    })
);

app.listen(PORT, () => {
    console.log(`Tester proxy running at http://localhost:${PORT}`);
    console.log(`Open http://localhost:${PORT}/test.html in your browser`);
});