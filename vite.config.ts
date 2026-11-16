import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Porta fixa: a URL de retorno do login Google depende dela.
export default defineConfig({
  plugins: [react()],
  server: { port: 5180, strictPort: true },
})
