import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/PresupuestoXLSX/',  // debe coincidir con el nombre de tu repo
  plugins: [react()],
})
