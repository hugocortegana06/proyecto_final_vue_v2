<template>
  <div class="container mt-5">
    <h2 class="mb-4 text-primary">Gestión de Vehículos</h2>

    <!-- Modal de éxito -->
    <div v-if="modalExito" class="custom-modal" @click.self="cerrarModalGlobal">
      <div class="modal-content-custom">
        <p class="text-center">{{ mensajeExito }}</p>
      </div>
    </div>

    <!-- Modal de confirmación de eliminación -->
    <div v-if="modalEliminar" class="custom-modal" @click.self="cerrarModalGlobal">
      <div class="modal-content-custom">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <h5 class="mb-0">Confirmar Eliminación</h5>
          <button type="button" class="btn-close" @click="cerrarModalEliminar"></button>
        </div>
        <p>
          ¿Estás seguro de que deseas eliminar el vehículo con matrícula
          <strong>{{ vehiculoAEliminar?.matricula }}</strong>?
        </p>
        <div class="d-flex justify-content-end">
          <button class="btn btn-secondary me-2" @click="cerrarModalEliminar">Cancelar</button>
          <button class="btn btn-danger" @click="confirmarEliminar">Eliminar</button>
        </div>
      </div>
    </div>

    <!-- Filtros y selección de elementos por página -->
    <div class="d-flex justify-content-between mb-3">
      <div>
        <label for="itemsPerPage" class="form-label">Elementos por página:</label>
        <select id="itemsPerPage" v-model.number="itemsPerPage" class="form-select" style="max-width: 200px;">
          <option v-for="option in itemsPerPageOptions" :key="option" :value="option">
            {{ option }}
          </option>
        </select>
      </div>
      <div>
        <label for="filtroMatricula" class="form-label">Filtrar por Matrícula:</label>
        <input id="filtroMatricula" v-model="filtroMatricula" type="text" class="form-control" placeholder="Buscar matrícula" style="max-width: 200px;" />
      </div>
      <div>
        <label for="filtroFecha" class="form-label">Filtrar por Fecha de Entrada:</label>
        <input id="filtroFecha" v-model="filtroFecha" type="date" class="form-control" style="max-width: 200px;" />
      </div>
      <div>
        <label for="filtroEstado" class="form-label">Filtrar por Estado:</label>
        <select id="filtroEstado" v-model="filtroEstado" class="form-select" style="max-width: 200px;">
          <option value="">Todos</option>
          <option value="En depósito">En depósito</option>
          <option value="Liquidado">Liquidado</option>
        </select>
      </div>
    </div>

    <!-- Botón para mostrar/ocultar formulario para añadir/editar vehículo -->
    <button class="btn btn-success mb-3" @click="toggleFormulario">
      {{ mostrarFormulario ? 'Ocultar Formulario' : 'Añadir Vehículo' }}
    </button>

    <!-- Formulario para añadir/editar vehículo -->
    <div v-if="mostrarFormulario" class="card mb-3">
      <div class="card-body">
        <h5 class="card-title">{{ editMode ? 'Editar Vehículo' : 'Nuevo Vehículo' }}</h5>
        <form @submit.prevent="guardarVehiculo">
          <!-- Fecha de Entrada (solo lectura) -->
          <div class="mb-3">
            <label class="form-label">Fecha de Entrada</label>
            <input type="text" v-model="nuevoVehiculo.fechaentrada" class="form-control" disabled />
          </div>
          <!-- Lugar -->
          <div class="mb-3">
            <label class="form-label">Lugar</label>
            <input type="text" v-model="nuevoVehiculo.lugar" class="form-control" />
            <small v-if="errors.lugar" class="text-danger">{{ errors.lugar }}</small>
          </div>
          <!-- Dirección -->
          <div class="mb-3">
            <label class="form-label">Dirección</label>
            <input type="text" v-model="nuevoVehiculo.direccion" class="form-control" />
            <small v-if="errors.direccion" class="text-danger">{{ errors.direccion }}</small>
          </div>
          <!-- Agente -->
          <div class="mb-3">
            <label class="form-label">Agente</label>
            <input type="text" v-model="nuevoVehiculo.agente" class="form-control" />
            <small v-if="errors.agente" class="text-danger">{{ errors.agente }}</small>
          </div>
          <!-- Matrícula (campo obligatorio con validación) -->
          <div class="mb-3">
            <label class="form-label">Matrícula</label>
            <input type="text" v-model="nuevoVehiculo.matricula" class="form-control" :class="{ 'is-invalid': errors.matricula }"  />
            <div class="invalid-feedback">{{ errors.matricula }}</div>
          </div>
          <!-- Marca -->
          <div class="mb-3">
            <label class="form-label">Marca</label>
            <input type="text" v-model="nuevoVehiculo.marca" class="form-control" />
            <small v-if="errors.marca" class="text-danger">{{ errors.marca }}</small>
          </div>
          <!-- Modelo -->
          <div class="mb-3">
            <label class="form-label">Modelo</label>
            <input type="text" v-model="nuevoVehiculo.modelo" class="form-control" />
            <small v-if="errors.modelo" class="text-danger">{{ errors.modelo }}</small>
          </div>
          <!-- Color -->
          <div class="mb-3">
            <label class="form-label">Color</label>
            <input type="text" v-model="nuevoVehiculo.color" class="form-control" />
            <small v-if="errors.color" class="text-danger">{{ errors.color }}</small>
          </div>
          <!-- Motivo -->
          <div class="mb-3">
            <label class="form-label">Motivo</label>
            <input type="text" v-model="nuevoVehiculo.motivo" class="form-control" />
            <small v-if="errors.motivo" class="text-danger">{{ errors.motivo }}</small>
          </div>
          <!-- Tipo de Vehículo (desplegable) -->
          <div class="mb-3">
            <label class="form-label">Tipo de Vehículo</label>
            <select v-model="nuevoVehiculo.tipovehiculo" class="form-select">
              <option value="Motocicleta, aperos, motocarros y similares: 25 €">
                Motocicleta, aperos, motocarros y similares: 25 €
              </option>
              <option value="Turismo hasta 12 cv ó Remolques hasta 750 kg">
                Turismo hasta 12 cv ó Remolques hasta 750 kg
              </option>
              <option value="Turismos más de 12 cv ó Remolques más de 750 kg">
                Turismos más de 12 cv ó Remolques hasta 750 kg
              </option>
              <option value="Vehículos especiales">Vehículos especiales</option>
              <option value="Vehículos de cortesía">Vehículos de cortesía</option>
              <option value="Chatarra">Chatarra</option>
            </select>
            <small v-if="errors.tipovehiculo" class="text-danger">{{ errors.tipovehiculo }}</small>
          </div>
          <!-- Grua -->
          <div class="mb-3">
            <label class="form-label">Grua</label>
            <input type="text" v-model="nuevoVehiculo.grua" class="form-control" />
            <small v-if="errors.grua" class="text-danger">{{ errors.grua }}</small>
          </div>
          <!-- Estado (fijo en 'En depósito') -->
          <div class="mb-3">
            <label class="form-label">Estado</label>
            <input type="text" v-model="nuevoVehiculo.estado" class="form-control" disabled />
          </div>
          <button type="submit" class="btn btn-primary">{{ editMode ? 'Actualizar' : 'Guardar Vehículo' }}</button>
          <button type="button" class="btn btn-secondary" @click="cancelarFormulario">Cancelar</button>
        </form>
      </div>
    </div>

    <!-- Tabla de vehículos (sin columna ID) -->
    <table class="table table-striped">
      <thead>
        <tr>
          <th>Fecha Entrada</th>
          <th>Fecha Salida</th>
          <th>Matrícula</th>
          <th>Marca</th>
          <th>Modelo</th>
          <th>Agente</th>
          <th>Color</th>
          <th>Motivo</th>
          <th>Tipo de Vehículo</th>
          <th>Estado</th>
          <th v-if="isAdmin">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="veh in paginatedVehiculos" :key="veh.id">
          <td>{{ formatDate(veh.fechaentrada) }}</td>
          <td>{{ veh.fechasalida ? formatDate(veh.fechasalida) : 'N/A' }}</td>
          <td>{{ veh.matricula }}</td>
          <td>{{ veh.marca }}</td>
          <td>{{ veh.modelo }}</td>
          <td>{{ veh.agente }}</td>
          <td>{{ veh.color }}</td>
          <td>{{ veh.motivo }}</td>
          <td>{{ veh.tipovehiculo }}</td>
          <td>{{ veh.estado }}</td>
          <td v-if="isAdmin">
            <button class="btn btn-sm btn-warning me-2" @click="editarVehiculo(veh)">Editar</button>
            <button class="btn btn-sm btn-danger" @click="mostrarModalEliminar(veh)">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Paginación -->
    <nav v-if="totalPages > 1" aria-label="Page navigation">
      <ul class="pagination">
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <button class="page-link" @click="goToPage(currentPage - 1)">Anterior</button>
        </li>
        <li class="page-item" v-for="page in totalPages" :key="page" :class="{ active: page === currentPage }">
          <button class="page-link" @click="goToPage(page)">{{ page }}</button>
        </li>
        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
          <button class="page-link" @click="goToPage(currentPage + 1)">Siguiente</button>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, inject } from 'vue'
import axios from 'axios'

// Inyectar objeto "user" y determinar si es admin
const user = inject('user')
const isAdmin = computed(() => {
  return user && user.value && user.value.role && user.value.role.toLowerCase() === 'admin'
})

// Lista completa de vehículos
const vehiculos = ref([])

// Filtros
const filtroMatricula = ref('')
const filtroFecha = ref('') // formato: YYYY-MM-DD
const filtroEstado = ref('')

// Paginación
const currentPage = ref(1)
const itemsPerPage = ref(parseInt(localStorage.getItem('itemsPerPage')) || 10)
const itemsPerPageOptions = [5, 10, 25, 50]

watch(itemsPerPage, (newVal) => {
  localStorage.setItem('itemsPerPage', newVal)
})

const filteredVehiculos = computed(() => {
  return vehiculos.value.filter(veh => {
    const matchMatricula = filtroMatricula.value
      ? veh.matricula && veh.matricula.toLowerCase().includes(filtroMatricula.value.toLowerCase())
      : true
    const matchFecha = filtroFecha.value
      ? veh.fechaentrada && veh.fechaentrada.slice(0, 10) === filtroFecha.value
      : true
    const matchEstado = filtroEstado.value
      ? veh.estado && veh.estado.toLowerCase() === filtroEstado.value.toLowerCase()
      : true
    return matchMatricula && matchFecha && matchEstado
  })
})

const totalPages = computed(() => Math.ceil(filteredVehiculos.value.length / itemsPerPage.value))
const paginatedVehiculos = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredVehiculos.value.slice(start, start + itemsPerPage.value)
})

// Control para añadir/editar vehículo
const mostrarFormulario = ref(false)
const editMode = ref(false)
const nuevoVehiculo = ref({
  id: null,
  fechaentrada: '',
  fechasalida: null,
  lugar: '',
  direccion: '',
  agente: '',
  matricula: '',
  marca: '',
  modelo: '',
  color: '',
  motivo: '',
  tipovehiculo: 'Motocicleta, aperos, motocarros y similares:',
  grua: '',
  estado: 'En depósito'
})

// Validación y modal de éxito
const errorMatricula = ref('')
const errors = ref({
  matricula: "",
  lugar: "",
  direccion: "",
  agente: "",
  marca: "",
  modelo: "",
  color: "",
  motivo: "",
  tipovehiculo: "",
  grua: ""
})
const mensajeExito = ref('')
const modalExito = ref(false)

// Modal de confirmación de eliminación
const modalEliminar = ref(false)
const vehiculoAEliminar = ref(null)

// Función para formatear fecha (si contiene "T", se convierte; de lo contrario, se asume ya en el formato deseado)
function formatDate(fecha) {
  if (!fecha) return 'N/A'
  if (fecha.includes('T')) {
    const d = new Date(fecha)
    return getFechaActual(d)
  }
  return fecha
}

// Función para obtener fecha/hora actual en formato 'YYYY-MM-DD HH:mm:ss'
function getFechaActual(dateObj) {
  const year = dateObj.getFullYear()
  const month = String(dateObj.getMonth() + 1).padStart(2, '0')
  const day = String(dateObj.getDate()).padStart(2, '0')
  const hours = String(dateObj.getHours()).padStart(2, '0')
  const minutes = String(dateObj.getMinutes()).padStart(2, '0')
  const seconds = String(dateObj.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// Función para cargar vehículos desde el backend
async function cargarVehiculos() {
  try {
    const { data } = await axios.get('/vehiculos')
    vehiculos.value = data
  } catch (error) {
    console.error('Error al cargar vehículos:', error)
  }
}

onMounted(async () => {
  await cargarVehiculos()
  const now = new Date()
  nuevoVehiculo.value.fechaentrada = getFechaActual(now)
})

// Paginación
function goToPage(page) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

// Alternar formulario
function toggleFormulario() {
  mostrarFormulario.value = !mostrarFormulario.value
  if (!mostrarFormulario.value) {
    cancelarFormulario()
  }
}

// Cancelar y limpiar formulario
function cancelarFormulario() {
  mostrarFormulario.value = false
  errorMatricula.value = ''
  errors.value = {
    matricula: "",
    lugar: "",
    direccion: "",
    agente: "",
    marca: "",
    modelo: "",
    color: "",
    motivo: "",
    tipovehiculo: "",
    grua: ""
  }
  mensajeExito.value = ''
  modalExito.value = false
  modalEliminar.value = false
  const now = new Date()
  nuevoVehiculo.value = {
    id: null,
    fechaentrada: getFechaActual(now),
    fechasalida: null,
    lugar: '',
    direccion: '',
    agente: '',
    matricula: '',
    marca: '',
    modelo: '',
    color: '',
    motivo: '',
    tipovehiculo: 'Motocicleta, aperos, motocarros y similares:',
    grua: '',
    estado: 'En depósito'
  }
}

// Función de validación del formulario de vehículo
function validarVehiculo() {
  let isValid = true;
  errors.value = {
    matricula: "",
    lugar: "",
    direccion: "",
    agente: "",
    marca: "",
    modelo: "",
    color: "",
    motivo: "",
    tipovehiculo: "",
    grua: ""
  };
  if (!nuevoVehiculo.value.matricula || nuevoVehiculo.value.matricula.trim().length < 3) {
    errors.value.matricula = "La matrícula debe tener al menos 3 caracteres.";
    isValid = false;
  }
  if (!nuevoVehiculo.value.lugar.trim()) {
    errors.value.lugar = "El campo Lugar es obligatorio.";
    isValid = false;
  }
  if (!nuevoVehiculo.value.direccion.trim()) {
    errors.value.direccion = "El campo Dirección es obligatorio.";
    isValid = false;
  }
  if (!nuevoVehiculo.value.agente.trim()) {
    errors.value.agente = "El campo Agente es obligatorio.";
    isValid = false;
  }
  if (!nuevoVehiculo.value.marca.trim()) {
    errors.value.marca = "El campo Marca es obligatorio.";
    isValid = false;
  }
  if (!nuevoVehiculo.value.modelo.trim()) {
    errors.value.modelo = "El campo Modelo es obligatorio.";
    isValid = false;
  }
  if (!nuevoVehiculo.value.color.trim()) {
    errors.value.color = "El campo Color es obligatorio.";
    isValid = false;
  }
  if (!nuevoVehiculo.value.motivo.trim()) {
    errors.value.motivo = "El campo Motivo es obligatorio.";
    isValid = false;
  }
  if (!nuevoVehiculo.value.tipovehiculo) {
    errors.value.tipovehiculo = "Debes seleccionar un Tipo de Vehículo.";
    isValid = false;
  }
  if (!nuevoVehiculo.value.grua.trim()) {
    errors.value.grua = "El campo Grua es obligatorio.";
    isValid = false;
  }
  return isValid;
}

// Función para guardar vehículo (POST o PUT)
async function guardarVehiculo() {
  if (!validarVehiculo()) return;
  try {
    if (editMode.value && nuevoVehiculo.value.id) {
      await axios.put(`/vehiculos/${nuevoVehiculo.value.id}`, nuevoVehiculo.value)
      mensajeExito.value = 'Vehículo editado exitosamente.';
    } else {
      await axios.post('/vehiculos', nuevoVehiculo.value)
      mensajeExito.value = 'Vehículo creado exitosamente.';
    }
    modalExito.value = true;
    setTimeout(() => {
      modalExito.value = false;
      cancelarFormulario();
      cargarVehiculos();
    }, 2000);
  } catch (error) {
    console.error('Error al guardar vehículo:', error);
  }
}

// Función para editar vehículo (modo edición)
function editarVehiculo(veh) {
  nuevoVehiculo.value = { ...veh };
  editMode.value = true;
  mostrarFormulario.value = true;
}

// Función para mostrar modal de eliminación
function mostrarModalEliminar(veh) {
  vehiculoAEliminar.value = veh;
  modalEliminar.value = true;
}

// Función para cerrar modal de eliminación
function cerrarModalEliminar() {
  modalEliminar.value = false;
  vehiculoAEliminar.value = null;
}

// Función para confirmar eliminación de vehículo
async function confirmarEliminar() {
  if (!vehiculoAEliminar.value) return;
  try {
    await axios.delete(`/vehiculos/${vehiculoAEliminar.value.id}`);
    cerrarModalEliminar();
    mensajeExito.value = 'Vehículo eliminado exitosamente.';
    modalExito.value = true;
    setTimeout(() => {
      modalExito.value = false;
      cargarVehiculos();
    }, 2000);
  } catch (error) {
    console.error('Error al eliminar vehículo:', error);
  }
}

// Función para obtener la matrícula de un vehículo a partir de su ID
function getMatriculaById(idVehiculo) {
  const veh = vehiculos.value.find(v => v.id == idVehiculo);
  return veh ? veh.matricula : 'N/A';
}
</script>

<style scoped>
.pagination .page-item.active .page-link {
  background-color: #0b3d91;
  border-color: #0b3d91;
}
.custom-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1050;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
}
.modal-content-custom {
  background-color: #fff;
  padding: 1.5rem;
  border-radius: 0.3rem;
  z-index: 1060;
  min-width: 300px;
}
.table {
  margin-top: 20px;
}
</style>
