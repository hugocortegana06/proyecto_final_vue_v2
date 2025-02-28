// frontend/src/router.js
import { createRouter, createWebHistory } from 'vue-router'
import Login from './components/Login.vue'
import Vehiculos from './components/Vehiculos.vue'
import Retiradas from './components/Retiradas.vue'
import Logs from './components/Logs.vue'
import Usuarios from './components/Usuarios.vue'

const routes = [
  { path: '/', component: Login },
  { path: '/vehiculos', component: Vehiculos, meta: { requiresAuth: true } },
  { path: '/retiradas', component: Retiradas, meta: { requiresAuth: true } },
  { path: '/logs', component: Logs, meta: { requiresAuth: true } },
  { path: '/usuarios', component: Usuarios, meta: { requiresAuth: true } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Guard global: verifica si la ruta requiere autenticación
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    // Convertir el valor almacenado a objeto
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    if (!user) {
      // Si no hay usuario, redirige al login
      return next({ path: '/' })
    }
  }
  next()
})

export default router
