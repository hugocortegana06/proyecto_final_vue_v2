<template>
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container">
        <router-link to="/vehiculos" class="navbar-brand">Grúa Municipal</router-link>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto">
            <li class="nav-item">
              <router-link to="/vehiculos" class="nav-link">Vehículos</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/retiradas" class="nav-link">Retiradas</router-link>
            </li>
            <li v-if="user && user.role && user.role.toLowerCase() === 'admin'" class="nav-item">
  <router-link to="/logs" class="nav-link">Ver logs</router-link>
</li>
<li v-if="user && user.role && user.role.toLowerCase() == 'admin'"
class="nav-item">
  <router-link to="/usuarios" class="nav-link">Gestionar usuarios</router-link>
</li>
            <li v-if="user" class="nav-item">
              <button @click="logout" class="btn btn-link nav-link">Cerrar sesión</button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  
 
  </template>
  
  <script setup>
  import { inject } from 'vue'
  import { useRouter } from 'vue-router'
  import axios from 'axios'
  
  const user = inject('user')
  const router = useRouter()
  
  async function logout() {
    try {
      await axios.post('/auth/logout')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    } finally {
      if (user) {
        localStorage.removeItem('user');
        user.value = null
      }
      router.push('/')
    }
  }
  </script>
  