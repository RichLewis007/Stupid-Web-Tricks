// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

const publicBase = process.env.PUBLIC_BASE_URL ?? '/';
const defaultSite =
  publicBase === '/stupid-web-tricks'
    ? 'https://richlewis007.com/stupid-web-tricks' // GitHub Pages with custom domain + path
    : 'https://stupid-web-tricks.pages.dev'; // Cloudflare Pages default

// https://astro.build/config
export default defineConfig({
  site: process.env.PUBLIC_SITE_URL ?? defaultSite,
  base: publicBase,
  integrations: [react()],
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      // Bundle ESM-only deps so Node doesn't try to load them as CJS during SSR
      noExternal: ['use-sound']
    }
  },
  build: {
    assets: '_astro'
  }
});
