import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 10,
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          }
        ]
      },
      includeAssets: ['favicon.ico', 'robots.txt'],
      manifest: {
        name: 'Q8 Basket',
        short_name: 'Q8Basket',
        description: 'Your online grocery shopping companion',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#d32f2f',
        orientation: 'portrait-primary',
        scope: '/',
        categories: ['shopping', 'food', 'lifestyle'],
        icons: [
          {
            src: 'icons/Logo.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: 'icons/icon-48.svg',
            sizes: '48x48',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: 'icons/icon-72.svg',
            sizes: '72x72',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: 'icons/icon-96.svg',
            sizes: '96x96',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: 'icons/icon-144.svg',
            sizes: '144x144',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: 'icons/icon-192.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          },
          {
            src: 'icons/icon-256.svg',
            sizes: '256x256',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: 'icons/icon-384.svg',
            sizes: '384x384',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: 'icons/icon-512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ],
        shortcuts: [
          {
            name: 'Search Products',
            short_name: 'Search',
            description: 'Search for products',
            url: '/search',
            icons: [{ src: 'icons/icon-192.png', sizes: '192x192' }]
          },
          {
            name: 'View Cart',
            short_name: 'Cart',
            description: 'View your shopping cart',
            url: '/cart',
            icons: [{ src: 'icons/icon-192.png', sizes: '192x192' }]
          }
        ]
      }
    }),
  ],
  base: './', // Important for Capacitor
});
