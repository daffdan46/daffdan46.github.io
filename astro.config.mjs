import { defineConfig } from 'astro/config';

// GitHub Pages:
// - Repo bernama <username>.github.io  → base: '/'
// - Repo lain (misal "portfolio")      → base: '/portfolio'
// Ganti SITE dan BASE sesuai repo lo.
const SITE = 'https://daffdan46.github.io';
const BASE = '/';

export default defineConfig({
  site: SITE,
  base: BASE,
  trailingSlash: 'ignore',
  build: { format: 'directory' },
});
