import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig(() => {
  return {
    plugins: [vue()],
    define: {
      VITE_API_1_URL: process.env.VITE_API_1_URL,
    }
  }
});