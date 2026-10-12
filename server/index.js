// ==============================================================================
// KYAARI JEWELLERY - STANDALONE PRODUCTION SERVER
// Serves Static Frontend & Secure Server-Side Razorpay API Endpoints
// ==============================================================================

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  handleCreateRazorpayOrder,
  handleVerifyPaymentSignature,
  handleValidateCart
} from './api-handlers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, '../dist');
const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.ico': 'image/x-icon'
};

const server = http.createServer(async (req, res) => {
  const url = req.url.split('?')[0];

  // 1. API Endpoints
  if (url.startsWith('/api/')) {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', async () => {
      try {
        const payload = body ? JSON.parse(body) : {};
        let result;

        if (url === '/api/create-razorpay-order') {
          result = await handleCreateRazorpayOrder(payload);
        } else if (url === '/api/verify-razorpay-payment') {
          result = await handleVerifyPaymentSignature(payload);
        } else if (url === '/api/validate-cart') {
          result = await handleValidateCart(payload);
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Endpoint not found' }));
        }

        res.writeHead(result.status, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result.data));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // 2. Static File Serving from dist/
  let filePath = path.join(DIST_DIR, url === '/' ? 'index.html' : url);
  const ext = path.extname(filePath).toLowerCase();

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // SPA Fallback to index.html
      filePath = path.join(DIST_DIR, 'index.html');
    }

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500);
        return res.end('Server Error loading asset');
      }

      const contentType = MIME_TYPES[path.extname(filePath)] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    });
  });
});

server.listen(PORT, () => {
  console.log(`[KYAARI JEWELLERY] Production Server listening on http://localhost:${PORT}`);
});
