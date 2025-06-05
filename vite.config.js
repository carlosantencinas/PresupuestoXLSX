import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/PresupuestoXLSX/', // 👈 esto es CLAVE
  plugins: [react()],
})
