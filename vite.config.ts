import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vercel serves the site at the domain root; GitHub Pages serves it under
// /Ready-2-Digital-Website/. BASE_PATH overrides both (the Pages workflow sets it).
export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  plugins: [react()],
});
