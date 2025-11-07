// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Support for multiple deployment platforms
  site: process.env.PUBLIC_BASE_URL 
    ? (process.env.PUBLIC_BASE_URL === '/stupid-web-tricks' 
        ? 'https://richlewis007.com'  // Custom domain for GitHub Pages
        : `https://richlewis007.github.io${process.env.PUBLIC_BASE_URL}`)
    : 'https://stupid-web-tricks.pages.dev',  // Default Cloudflare Pages
  integrations: [react()],
  output: 'static',
  vite: {
    plugins: [tailwindcss()]
  },
  build: {
    assets: '_astro'
  }
});