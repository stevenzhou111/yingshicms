const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const dist = path.join(__dirname, 'dist');
const PORT = 5173;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
};

function fetchUrl(target) {
  return new Promise((resolve, reject) => {
    const mod = target.startsWith('https') ? https : http;
    const req = mod.get(target, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks) }));
    });
    req.on('error', reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('timeout')); });
  });
}

const server = http.createServer(async (req, res) => {
  // Use WHATWG URL API instead of deprecated url.parse()
  let pathname, targetUrl;
  try {
    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    pathname = parsedUrl.pathname;
    targetUrl = parsedUrl.searchParams.get('url');
  } catch {
    pathname = '/';
    targetUrl = null;
  }

  // CORS proxy endpoint
  if (pathname === '/api/proxy') {
    if (!targetUrl) {
      res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(JSON.stringify({ error: 'Missing ?url=' }));
      return;
    }
    try {
      const result = await fetchUrl(targetUrl);
      res.writeHead(result.status, {
        'Content-Type': result.headers['content-type'] || 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=60',
      });
      res.end(result.body);
    } catch (e) {
      res.writeHead(502, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // Static file serving
  if (pathname === '/') pathname = '/index.html';

  const fullPath = path.join(dist, pathname);
  if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
    const ext = path.extname(fullPath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    fs.createReadStream(fullPath).pipe(res);
  } else {
    // SPA fallback
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    fs.createReadStream(path.join(dist, 'index.html')).pipe(res);
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n  CloudMovie running at:\n`);
  console.log(`    Local:   http://localhost:${PORT}`);
  console.log(`    Network: http://0.0.0.0:${PORT}\n`);
});
