import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

function replayApiProxy() {
  return {
    name: 'replay-api-dev-proxy',
    configureServer(server) {
      server.middlewares.use('/replay-api', async (req, res, next) => {
        if (req.method !== 'GET' || !req.url) return next()
        try {
          const upstream = await fetch(`https://livextv-backend.onrender.com/api${req.url}`, {
            headers: { Accept: 'application/json' },
          })
          res.statusCode = upstream.status
          res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json; charset=utf-8')
          res.end(await upstream.text())
        } catch {
          res.statusCode = 502
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.end(JSON.stringify({ success: false, error: 'The replay catalogue is unavailable in preview.' }))
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), replayApiProxy()],
  server: {
    host: '0.0.0.0',
    allowedHosts: ['5173-inxbqwjaj2xzjetsmvfsi-f08c213a.sg2.manus.computer'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor-react';
            }
            if (id.includes('@radix-ui')) {
              return 'vendor-ui';
            }
            if (id.includes('firebase')) {
              return 'vendor-firebase';
            }
            if (id.includes('framer-motion')) {
              return 'vendor-animation';
            }
            if (id.includes('@tanstack/react-query')) {
              return 'vendor-query';
            }
            return 'vendor-other';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
})
