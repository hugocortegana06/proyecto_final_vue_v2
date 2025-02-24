// frontend/src/router.js
import { createRouter, createWebHistory } from 'vue-router'
import Login from './components/Login.vue'
import Vehiculos from './components/Vehiculos.vue'
import Retiradas from './components/Retiradas.vue'
import Logs from './components/Logs.vue'            // Componente stub para logs
import Usuarios from './components/Usuarios.vue'      // Componente stub para gestión de usuarios

const routes = [
  { path: '/', component: Login },
  { path: '/vehiculos', component: Vehiculos },
  { path: '/retiradas', component: Retiradas },
  { path: '/logs', component: Logs },
  { path: '/usuarios', component: Usuarios }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
