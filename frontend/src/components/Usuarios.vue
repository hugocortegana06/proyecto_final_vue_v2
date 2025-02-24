<template>
  <div class="container mt-5">
    <h2 class="mb-4 text-primary">Gestión de Usuarios</h2>

    <!-- Botón para crear nuevo usuario -->
    <button class="btn btn-success mb-3" @click="modoNuevo">Nuevo Usuario</button>

    <!-- Formulario para crear/editar usuario -->
    <div v-if="mostrarFormulario" class="card mb-3">
      <div class="card-body">
        <h5 class="card-title">{{ editMode ? 'Editar Usuario' : 'Nuevo Usuario' }}</h5>
        <form @submit.prevent="guardarUsuario">
          <div class="mb-3">
            <label class="form-label">Username</label>
            <input
              type="text"
              v-model="usuario.username"
              class="form-control"
              :class="{ 'is-invalid': errorUsername }"
              required
            />
            <div class="invalid-feedback">{{ errorUsername }}</div>
          </div>
          <div class="mb-3">
            <label class="form-label">Contraseña</label>
            <input
              type="text"
              v-model="usuario.password"
              class="form-control"
              :class="{ 'is-invalid': errorPassword }"
              required
            />
            <div class="invalid-feedback">{{ errorPassword }}</div>
          </div>
          <div class="mb-3">
            <label class="form-label">Rol</label>
            <select v-model="usuario.role" class="form-select" required>
              <option value="admin">Admin</option>
              <option value="operario">Operario</option>
            </select>
          </div>
          <button type="submit" class="btn btn-primary">
            {{ editMode ? 'Actualizar' : 'Crear' }}
          </button>
          <button type="button" class="btn btn-secondary" @click="cancelar">
            Cancelar
          </button>
        </form>
      </div>
    </div>

    <!-- Tabla de usuarios -->
    <table class="table table-striped">
      <thead>
        <tr>
          <th>ID</th>
          <th>Username</th>
          <th>Rol</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="u in listaUsuarios" :key="u.id">
          <td>{{ u.id }}</td>
          <td>{{ u.username }}</td>
          <td>{{ u.role }}</td>
          <td>
            <button class="btn btn-sm btn-warning me-2" @click="editarUsuario(u)">Editar</button>
            <button class="btn btn-sm btn-danger" @click="mostrarModal(u)">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Modal de confirmación para eliminar usuario -->
  <div
    class="modal fade"
    :class="{ show: modalVisible }"
    :style="{ display: modalVisible ? 'block' : 'none' }"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Confirmar eliminación</h5>
          <button type="button" class="btn-close" @click="cerrarModal"></button>
        </div>
        <div class="modal-body">
          <p>
            ¿Estás seguro de que deseas eliminar al usuario
            <strong>{{ usuarioAEliminar ? usuarioAEliminar.username : '' }}</strong>?
          </p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="cerrarModal">Cancelar</button>
          <button class="btn btn-danger" @click="confirmarEliminar">Eliminar</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Fondo oscuro del modal -->
  <div
    class="modal-backdrop fade"
    :class="{ show: modalVisible }"
    v-if="modalVisible"
  ></div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

// Lista de usuarios
const listaUsuarios = ref([])

// Control del formulario de crear/editar
const mostrarFormulario = ref(false)
const editMode = ref(false)

// Objeto para crear o editar usuario
const usuario = ref({
  id: null,
  username: '',
  password: '',
  role: 'operario'
})

// Variables de validación
const errorUsername = ref('')
const errorPassword = ref('')

// Variables para el modal de eliminación
const modalVisible = ref(false)
const usuarioAEliminar = ref(null)

onMounted(() => {
  cargarUsuarios()
})

// Función para cargar usuarios
async function cargarUsuarios() {
  try {
    // Cambiado a '/usuarios' ya que axios.defaults.baseURL incluye '/api'
    const { data } = await axios.get('/usuarios')
    console.log("Usuarios recibidos:", data)
    listaUsuarios.value = data
  } catch (error) {
    console.error('Error al cargar usuarios:', error)
  }
}

// Activar modo nuevo usuario
function modoNuevo() {
  usuario.value = {
    id: null,
    username: '',
    password: '',
    role: 'operario'
  }
  mostrarFormulario.value = true
  editMode.value = false
  errorUsername.value = ''
  errorPassword.value = ''
}

// Activar modo editar usuario
function editarUsuario(u) {
  usuario.value = { ...u }
  mostrarFormulario.value = true
  editMode.value = true
  errorUsername.value = ''
  errorPassword.value = ''
}

// Validar formulario
function validarFormulario() {
  let valido = true
  errorUsername.value = ''
  errorPassword.value = ''

  if (!usuario.value.username || usuario.value.username.length < 3) {
    errorUsername.value = 'El nombre de usuario debe tener al menos 3 caracteres.'
    valido = false
  }
  if (!usuario.value.password || usuario.value.password.length < 4) {
    errorPassword.value = 'La contraseña debe tener al menos 4 caracteres.'
    valido = false
  }
  return valido
}

// Guardar usuario (crear o actualizar)
async function guardarUsuario() {
  if (!validarFormulario()) return
  try {
    if (editMode.value) {
      await axios.put(`/usuarios/${usuario.value.id}`, usuario.value)
    } else {
      await axios.post('/usuarios', usuario.value)
    }
    mostrarFormulario.value = false
    cargarUsuarios()
  } catch (error) {
    console.error('Error al guardar usuario:', error)
  }
}

// Cancelar formulario
function cancelar() {
  mostrarFormulario.value = false
}

// Mostrar el modal de eliminación
function mostrarModal(u) {
  usuarioAEliminar.value = u
  modalVisible.value = true
}

// Cerrar el modal
function cerrarModal() {
  modalVisible.value = false
  usuarioAEliminar.value = null
}

// Confirmar eliminación
async function confirmarEliminar() {
  if (!usuarioAEliminar.value) return
  try {
    await axios.delete(`/usuarios/${usuarioAEliminar.value.id}`)
    cargarUsuarios()
  } catch (error) {
    console.error('Error al eliminar usuario:', error)
  } finally {
    cerrarModal()
  }
}
</script>

<style scoped>
.modal.fade.show {
  opacity: 1;
}
.modal.fade {
  opacity: 0;
  transition: opacity 0.15s linear;
}
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
}
</style>
