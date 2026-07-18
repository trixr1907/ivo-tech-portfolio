import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  preview: {
    host: '0.0.0.0',
    port: 4173,
    strictPort: true,
  },
  plugins: [react()],
  build: {
    // Hero3DLogo is React.lazy + IntersectionObserver-gated.
    // three ships as one WebGL core graph (~0.8–0.9 MB min) once that
    // boundary loads — do NOT force-pack node_modules/three into a
    // manual chunk (that disabled tree-shaking and made it worse).
    // Limit sits just above the deferred hero chunk so the warning
    // only fires if the INITIAL graph regresses.
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules/motion') || id.includes('node_modules/@motionone')) {
            return 'motion-vendor'
          }
        },
      },
    },
  },
})
