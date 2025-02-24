import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Importa los estilos (Vite se encarga de procesarlos e inyectarlos)
import 'bootstrap/dist/css/bootstrap.min.css'
import './assets/styles/custom.scss'
import 'animate.css'

// Configuración de axios
import axios from 'axios'
axios.defaults.baseURL = 'http://localhost:3000/api'
axios.defaults.withCredentials = true

// Configura un interceptor para respuestas 401
axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        // Obtén el router y redirige a login
        const router = useRouter()  // Esto solo funciona en setup; en main.js es más complejo
        // Una alternativa es usar window.location o un event bus global
        window.location.href = '/' // Redirige al login
      }
      return Promise.reject(error)
    }
  )
createApp(App).use(router).mount('#app')
