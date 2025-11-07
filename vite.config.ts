/// <reference types="vitest" />
import { defineConfig, type UserConfig } from 'vite';
import type { UserConfig as VitestUserConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import { VitePWA } from 'vite-plugin-pwa';

type ViteConfigWithVitest = UserConfig & { test?: VitestUserConfig['test'] };

// https://vite.dev/config/
const config: ViteConfigWithVitest = {
  base: '/odd-one-out/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['vite.svg', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'Odd One Out',
        short_name: 'OddOneOut',
        description: 'Fast-paced emoji pattern game to spot the odd tile.',
        theme_color: '#0c0e13',
        background_color: '#0c0e13',
        display: 'standalone',
        start_url: '/odd-one-out/',
        scope: '/odd-one-out/',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    coverage: {
      reporter: ['text', 'lcov'],
    },
    css: true,
  },
};

export default defineConfig(config);
