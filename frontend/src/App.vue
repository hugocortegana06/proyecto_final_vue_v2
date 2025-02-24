<template>
  <div>
    <!-- Solo se muestra el NavBar si no estamos en la ruta de login -->
    <NavBar v-if="showNavbar" :user="user" />
    <router-view />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, provide } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import NavBar from './components/NavBar.vue'

const user = ref(null)
provide('user', user)

const route = useRoute()
const showNavbar = computed(() => route.path !== '/') // Asumiendo que '/' es login

async function checkLogin() {
  try {
    const { data } = await axios.get('/auth/isLoggedIn')
    if (data.loggedIn) {
      user.value = data.user
    }
  } catch (error) {
    console.error('Error al verificar sesión:', error)
  }
}

onMounted(() => {
  checkLogin()
})
</script>
