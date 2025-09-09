import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api_user': {
        target: 'http://8.134.172.28:3008',
        changeOrigin: true,
        rewrite: (path) => path
      }
      ,
      '/api_cat': {
        target: 'http://8.134.172.28:3008',
        changeOrigin: true,
        rewrite: (path) => path
      },
      '/api_banner': {
        target: 'http://8.134.172.28:3008',
        changeOrigin: true,
        rewrite: (path) => path
      },
      '/api_goods': {
        target: 'http://8.134.172.28:3008',
        changeOrigin: true,
        rewrite: (path) => path
      },
      '/api_cart': {
        target: 'http://8.134.172.28:3008',
        changeOrigin: true,
        rewrite: (path) => path
      },
      '/api_search':  {
        target: 'http://8.134.172.28:3008',
        changeOrigin: true,
        rewrite: (path) => path
      },
    }
  }
})