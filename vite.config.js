import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig(() => {
  return {
    plugins: [vue()],
    server: {
      port: 6173,
      host: true // This is equivalent to --host
    }
  }
});