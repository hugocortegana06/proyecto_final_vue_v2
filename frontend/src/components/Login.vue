<template>
  <div class="container d-flex justify-content-center align-items-center" style="height: 100vh;">
    <div class="card shadow p-4 animate__animated animate__fadeInDown" style="max-width: 400px; width: 100%;">
      <div class="card-body">
        <h2 class="mb-4 text-primary">Iniciar Sesión</h2>
        <form @submit.prevent="login">
          <div class="mb-3">
            <label for="username" class="form-label">Usuario:</label>
            <input v-model="username" type="text" class="form-control" id="username" placeholder="Usuario" required>
          </div>
          <div class="mb-3">
            <label for="password" class="form-label">Contraseña:</label>
            <input v-model="password" type="password" class="form-control" id="password" placeholder="Contraseña" required>
          </div>
          <button type="submit" class="btn btn-primary w-100">Acceder</button>
        </form>
        <p v-if="error" class="text-danger mt-3">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const username = ref('')
const password = ref('')
const error = ref('')
const router = useRouter()

// Inyectamos el estado global "user" definido en App.vue
const user = inject('user')

async function login() {
  error.value = ''
  try {
    const { data } = await axios.post('/auth/login', {
      username: username.value,
      password: password.value
      
    })
    console.log('Login OK:', data)
    // Actualiza el estado global con los datos del usuario
    if (user) {
      user.value = data.user
    }
    // Redirige a la ruta de vehículos
    router.push('/vehiculos')
  } catch (err) {
    error.value = err.response?.data?.message || 'Error al iniciar sesión'
  }
}
</script>
