/**
 * DevSphere Luxury Portfolio - Production Server
 * Featuring:
 * - SQLite 3 Native High-Performance Database (node:sqlite)
 * - Automatic Data Migration & Dual Backup
 * - Real-time Inquiries & Verified Reviews APIs
 * - Live Cloudflare Global Tunnel (https://*.trycloudflare.com)
 * - Built-in Visual Database Admin Manager (/database & /admin)
 * - Gzip Compression & Static File Caching
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { spawn } = require('child_process');
const db = require('./db.js');

const PORT = process.env.PORT || 3000;
let currentLiveUrl = null;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf'
};

const server = http.createServer((req, res) => {
  // CORS & Security Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Parse path & query
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // Log visitor to SQLite database
  if (!pathname.startsWith('/api/') && !pathname.includes('.')) {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const ua = req.headers['user-agent'] || '';
    db.logVisitor(ip, ua, pathname);
  }

  // ==========================================
  // API: Live Status
  // ==========================================
  if (pathname === '/api/live-status' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      liveUrl: currentLiveUrl,
      localUrl: `http://localhost:${PORT}`,
      database: db.isNativeSqlite ? 'SQLite 3' : 'JSON Fallback'
    }));
  }

  // ==========================================
  // API: Database Stats & Health
  // ==========================================
  if (pathname === '/api/db/stats' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(db.getDbStats()));
  }

  // ==========================================
  // API: Portfolio Config (SQLite)
  // ==========================================
  if (pathname === '/api/config') {
    if (req.method === 'GET') {
      const cfg = db.getConfig();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(cfg));
    }

    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          db.saveConfig(parsed);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true }));
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: e.message }));
        }
      });
      return;
    }
  }

  // ==========================================
  // API: Reviews & Testimonials (SQLite)
  // ==========================================
  if (pathname === '/api/reviews') {
    if (req.method === 'GET') {
      const reviews = db.getReviews();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(reviews));
    }

    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const newReview = JSON.parse(body);
          if (!newReview.author || !newReview.quote) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Author and quote are required.' }));
          }
          const saved = db.addReview(newReview);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, review: saved, reviews: db.getReviews() }));
        } catch (e) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: e.message }));
        }
      });
      return;
    }
  }

  // ==========================================
  // API: Inquiries & Orders (SQLite)
  // ==========================================
  if (pathname === '/api/inquiries') {
    if (req.method === 'GET') {
      const inquiries = db.getInquiries();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(inquiries));
    }

    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const newInquiry = JSON.parse(body);
          const saved = db.addInquiry(newInquiry);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, inquiry: saved }));
        } catch (e) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: e.message }));
        }
      });
      return;
    }
  }

  // ==========================================
  // Route: Database Manager UI
  // ==========================================
  if (pathname === '/database' || pathname === '/admin') {
    const dbHtmlPath = path.join(__dirname, 'database.html');
    fs.readFile(dbHtmlPath, (err, content) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        return res.end('Database manager UI not found.');
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(content);
    });
    return;
  }

  // ==========================================
  // Static Files Serving
  // ==========================================
  let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname.replace(/^\//, ''));
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500);
        res.end('Server Error: ' + err.code);
      }
      return;
    }

    const acceptEncoding = req.headers['accept-encoding'] || '';
    const isCompressible = /^(text\/|application\/javascript|application\/json)/.test(contentType);

    const headers = {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*'
    };

    if (ext === '.html') {
      headers['Cache-Control'] = 'no-cache';
    } else {
      headers['Cache-Control'] = 'public, max-age=604800, stale-while-revalidate=86400';
    }

    if (isCompressible && acceptEncoding.includes('gzip')) {
      zlib.gzip(content, (gzipErr, compressed) => {
        if (!gzipErr && compressed) {
          headers['Content-Encoding'] = 'gzip';
          headers['Content-Length'] = compressed.length;
          res.writeHead(200, headers);
          res.end(compressed);
        } else {
          headers['Content-Length'] = content.length;
          res.writeHead(200, headers);
          res.end(content);
        }
      });
    } else {
      headers['Content-Length'] = content.length;
      res.writeHead(200, headers);
      res.end(content);
    }
  });
});

// Start HTTP Server
server.listen(PORT, () => {
  console.log('\n======================================================');
  console.log(` DevSphere Luxury Portfolio Server`);
  console.log(` Local URL:     http://localhost:${PORT}`);
  console.log(` Database UI:   http://localhost:${PORT}/database`);
  console.log(` SQLite DB:     data/portfolio.db`);
  console.log('======================================================\n');

  startLiveTunnel();
});

/**
 * Start Cloudflare Live Tunnel
 */
function startLiveTunnel() {
  const cloudflaredBin = path.join(__dirname, 'cloudflared.exe');

  if (!fs.existsSync(cloudflaredBin)) {
    console.log('[Tunnel] Note: cloudflared.exe not found. Running in local mode.');
    return;
  }

  console.log('[Tunnel] Initializing Cloudflare live tunnel...');

  try {
    const tunnel = spawn(cloudflaredBin, ['tunnel', '--url', `http://localhost:${PORT}`]);

    tunnel.stderr.on('data', chunk => {
      const text = chunk.toString();
      const match = text.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/i);
      if (match && !currentLiveUrl) {
        currentLiveUrl = match[0];
        
        // Save to file for quick reference
        try {
          fs.writeFileSync(path.join(__dirname, 'live-link.txt'), currentLiveUrl, 'utf8');
        } catch (e) {}

        console.log('\n******************************************************');
        console.log(' ✨ 🌐 YOUR PORTFOLIO IS NOW LIVE WORLDWIDE! 🌐 ✨');
        console.log(` Public Live Link:     ${currentLiveUrl}`);
        console.log(` Live Database Portal: ${currentLiveUrl}/database`);
        console.log('******************************************************\n');
      }
    });

    tunnel.on('close', code => {
      console.log(`[Tunnel] Cloudflared process closed with code ${code}. Reconnecting in 3 seconds...`);
      currentLiveUrl = null;
      setTimeout(startLiveTunnel, 3000);
    });

    // Clean exit
    process.on('SIGINT', () => {
      try { tunnel.kill(); } catch (e) {}
      process.exit(0);
    });
    process.on('SIGTERM', () => {
      try { tunnel.kill(); } catch (e) {}
      process.exit(0);
    });

  } catch (err) {
    console.warn('[Tunnel] Could not launch tunnel:', err.message);
  }
}
