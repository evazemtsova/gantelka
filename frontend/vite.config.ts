import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'brand/logo-120.png'],
      manifest: {
        name: 'Гантелька',
        short_name: 'Гантелька',
        description: 'Персональный тренировочный блокнот',
        theme_color: '#fbf9f8',
        background_color: '#fbf9f8',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'brand/logo-120.png',
            sizes: '120x120',
            type: 'image/png',
          },
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        runtimeCaching: [
          {
            // Google Fonts — кэшируем чтобы шрифты работали офлайн
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
});
