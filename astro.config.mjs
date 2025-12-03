// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

const publicBase = process.env.PUBLIC_BASE_URL ?? '/';
const defaultSite =
  publicBase === '/Stupid-Web-Tricks'
    ? 'https://richlewis007.com/Stupid-Web-Tricks' // GitHub Pages with custom domain + path (case-sensitive)
    : 'https://stupid-web-tricks.pages.dev'; // Cloudflare Pages default

// https://astro.build/config
export default defineConfig({
  site: process.env.PUBLIC_SITE_URL ?? defaultSite,
  base: publicBase,
  integrations: [react()],
  output: 'static',
  devToolbar: {
    enabled: false,
  },
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      // Bundle ESM-only deps so Node doesn't try to load them as CJS during SSR
      noExternal: ['use-sound'],
    },
  },
  build: {
    assets: '_astro',
  },
});
