import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import {
  handleCreateRazorpayOrder,
  handleVerifyPaymentSignature,
  handleValidateCart
} from './server/api-handlers.js';

// Custom Vite plugin to handle server-side API endpoints during development
function kyaariApiPlugin() {
  return {
    name: 'kyaari-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url.split('?')[0];
        if (url.startsWith('/api/')) {
          let rawBody = '';
          req.on('data', (chunk) => {
            rawBody += chunk;
          });
          req.on('end', async () => {
            try {
              const body = rawBody ? JSON.parse(rawBody) : {};
              let response;

              if (url === '/api/create-razorpay-order') {
                response = await handleCreateRazorpayOrder(body);
              } else if (url === '/api/verify-razorpay-payment') {
                response = await handleVerifyPaymentSignature(body);
              } else if (url === '/api/validate-cart') {
                response = await handleValidateCart(body);
              } else {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify({ error: 'API endpoint not found' }));
              }

              res.statusCode = response.status;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(response.data));
            } catch (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
        } else {
          next();
        }
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables for server-side handlers
  const env = loadEnv(mode, process.cwd(), '');
  process.env = { ...process.env, ...env };

  return {
    plugins: [react(), kyaariApiPlugin()],
    server: {
      allowedHosts: true
    },
    test: {
      environment: 'node',
      globals: true
    }
  };
});
