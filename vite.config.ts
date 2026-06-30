import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  server: {
    port: 1500,
    strictPort: true   // fail loudly instead of silently picking another port
  }
});