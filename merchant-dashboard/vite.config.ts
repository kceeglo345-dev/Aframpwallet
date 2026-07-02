import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import wasm from 'vite-plugin-wasm'

export default defineConfig({
  // @ts-expect-error — vite-plugin-wasm 3.6.0 nodenext compat
  plugins: [react(), tailwindcss(), wasm()],
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },

})
