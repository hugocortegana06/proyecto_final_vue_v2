import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // Elimina la línea: axios: 'axios/dist/axios.min.js'
      // Animate.css ya no es necesario alias si no te da problemas:
      // 'animate.css': 'animate.css/animate.min.css'
    }
  },
  // Si tienes esto, lo puedes dejar
  optimizeDeps: {
    include: ['axios']
  }
})
