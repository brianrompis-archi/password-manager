import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // This plugin inlines all JS and CSS into the HTML file
    viteSingleFile(),
  ],
  build: {
    // Output to a 'dist' folder
    outDir: 'dist',
    emptyOutDir: true,
  },
});