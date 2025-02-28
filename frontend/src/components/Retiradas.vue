<template>
  <div class="container mt-5">
    <h2 class="mb-4 text-primary">Gestión de Retiradas</h2>
    
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
          ¿Estás seguro de que deseas eliminar la retirada del vehículo con matrícula
          <strong>{{ getMatriculaById(retiradaAEliminar?.idvehiculos) }}</strong>?
        </p>
        <div class="d-flex justify-content-end">
          <button class="btn btn-secondary me-2" @click="cerrarModalEliminar">Cancelar</button>
          <button class="btn btn-danger" @click="confirmarEliminar">Eliminar</button>
        </div>
      </div>
    </div>
    
    <!-- Botón para mostrar/ocultar formulario de nueva retirada -->
    <button class="btn btn-success mb-3" @click="toggleFormulario">
      {{ mostrarFormulario ? 'Ocultar Formulario' : 'Añadir Retirada' }}
    </button>
    
    <!-- Formulario para añadir/editar retirada -->
    <div v-if="mostrarFormulario" class="card mb-3">
      <div class="card-body">
        <h5 class="card-title">
          {{ editModeRet ? 'Editar Retirada' : 'Nueva Retirada' }}
        </h5>
        <form @submit.prevent="guardarRetirada">
          <!-- Selección de vehículo (solo vehículos en "En depósito"). En edición se deshabilita -->
          <div class="mb-3">
            <label for="vehiculoSelect" class="form-label">Selecciona Matrícula del Vehículo:</label>
            <select 
              id="vehiculoSelect" 
              v-model="retirada.idvehiculos" 
              class="form-select" 
              @change="onVehiculoChange" 
               
              :disabled="editModeRet"
            >
              <option value="">-- Selecciona un vehículo --</option>
              <option v-for="veh in vehiculosDisponibles" :key="veh.id" :value="veh.id">
                {{ veh.matricula }}
              </option>
            </select>
            <small v-if="errors.idvehiculos" class="text-danger">{{ errors.idvehiculos }}</small>
          </div>
          
          <!-- Nombre -->
          <div class="mb-3">
            <label class="form-label">Nombre</label>
            <input type="text" v-model="retirada.nombre" class="form-control" placeholder="Ingresa nombre" >
            <small v-if="errors.nombre" class="text-danger">{{ errors.nombre }}</small>
          </div>
          
          <!-- NIF -->
          <div class="mb-3">
            <label class="form-label">NIF</label>
            <input type="text" v-model="retirada.nif" class="form-control" placeholder="Ingresa NIF" >
            <small v-if="errors.nif" class="text-danger">{{ errors.nif }}</small>
          </div>
          
          <!-- Domicilio -->
          <div class="mb-3">
            <label class="form-label">Domicilio</label>
            <input type="text" v-model="retirada.domicilio" class="form-control" placeholder="Ingresa domicilio" >
            <small v-if="errors.domicilio" class="text-danger">{{ errors.domicilio }}</small>
          </div>
          
          <!-- Población -->
          <div class="mb-3">
            <label class="form-label">Población</label>
            <input type="text" v-model="retirada.poblacion" class="form-control" placeholder="Ingresa población" >
            <small v-if="errors.poblacion" class="text-danger">{{ errors.poblacion }}</small>
          </div>
          
          <!-- Provincia -->
          <div class="mb-3">
            <label class="form-label">Provincia</label>
            <input type="text" v-model="retirada.provincia" class="form-control" placeholder="Ingresa provincia" >
            <small v-if="errors.provincia" class="text-danger">{{ errors.provincia }}</small>
          </div>
          
          <!-- Permiso -->
          <div class="mb-3">
            <label class="form-label">Permiso</label>
            <select v-model="retirada.permiso" class="form-select" >
              <option value="">-- Selecciona permiso --</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>
            <small v-if="errors.permiso" class="text-danger">{{ errors.permiso }}</small>
          </div>
          
          <!-- Fecha actual (no editable) -->
          <div class="mb-3">
            <label class="form-label">Fecha</label>
            <input type="text" v-model="retirada.fecha" class="form-control" disabled>
          </div>
          
          <!-- Agente (autocompletado, no editable) -->
          <div class="mb-3">
            <label class="form-label">Agente</label>
            <input type="text" v-model="retirada.agente" class="form-control" disabled>
          </div>
          
          <!-- Importe Depósito (calculado, no editable) -->
          <div class="mb-3">
            <label class="form-label">Importe Depósito</label>
            <input type="text" v-model="retirada.importedeposito" class="form-control" disabled>
          </div>
          
          <!-- Importe Retirada (calculado, no editable) -->
          <div class="mb-3">
            <label class="form-label">Importe Retirada</label>
            <input type="text" v-model="retirada.importeretirada" class="form-control" disabled>
          </div>
          
          <!-- Total (editable solo en modo edición) -->
          <div class="mb-3">
            <label class="form-label">Total</label>
            <input type="text" v-model="retirada.total" class="form-control" :disabled="!editModeRet" >
            <small v-if="errors.total" class="text-danger">{{ errors.total }}</small>
          </div>
          
          <!-- Opción de Pago -->
          <div class="mb-3">
            <label class="form-label">Opción de Pago</label>
            <select v-model="retirada.opcionespago" class="form-select" >
              <option value="">-- Selecciona opción --</option>
              <option value="Tarjeta">Tarjeta</option>
              <option value="Efectivo">Efectivo</option>
            </select>
            <small v-if="errors.opcionespago" class="text-danger">{{ errors.opcionespago }}</small>
          </div>
          
          <button type="submit" class="btn btn-primary">
            {{ editModeRet ? 'Actualizar' : 'Guardar Retirada' }}
          </button>
          <button type="button" class="btn btn-secondary" @click="cancelarRetirada">Cancelar</button>
        </form>
      </div>
    </div>
    
    <!-- Tabla de retiradas -->
    <table class="table table-striped" v-if="retiradas.length > 0">
      <thead>
        <tr>
          <th>Matrícula</th>
          <th>Nombre</th>
          <th>NIF</th>
          <th>Domicilio</th>
          <th>Población</th>
          <th>Provincia</th>
          <th>Permiso</th>
          <th>Fecha</th>
          <th>Agente</th>
          <th>Importe Retirada</th>
          <th>Importe Depósito</th>
          <th>Total</th>
          <th>Opción de Pago</th>
          <th v-if="isAdmin">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="retiro in paginatedRetiradas" :key="retiro.idvehiculos">
          <td>{{ getMatriculaById(retiro.idvehiculos) }}</td>
          <td>{{ retiro.nombre }}</td>
          <td>{{ retiro.nif }}</td>
          <td>{{ retiro.domicilio }}</td>
          <td>{{ retiro.poblacion }}</td>
          <td>{{ retiro.provincia }}</td>
          <td>{{ retiro.permiso }}</td>
          <td>{{ formatDate(retiro.fecha) }}</td>
          <td>{{ retiro.agente }}</td>
          <td>{{ retiro.importeretirada }}</td>
          <td>{{ retiro.importedeposito }}</td>
          <td>{{ retiro.total }}</td>
          <td>{{ retiro.opcionespago }}</td>
          <td v-if="isAdmin">
            <div class="d-flex">
              <button class="btn btn-sm btn-info me-2" @click="generarFactura(retiro)">Generar Factura</button>
              <template v-if="isAdmin">
                <button class="btn btn-sm btn-warning me-2" @click="editarRetirada(retiro)">Editar</button>
                <button class="btn btn-sm btn-danger" @click="mostrarModalEliminar(retiro)">Eliminar</button>
              </template>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-else>
      <p>No hay retiradas registradas.</p>
    </div>
    
    <!-- Paginación para retiradas -->
    <nav v-if="totalPagesRet > 1" aria-label="Page navigation">
      <ul class="pagination">
        <li class="page-item" :class="{ disabled: currentPageRet === 1 }">
          <button class="page-link" @click="goToPageRet(currentPageRet - 1)">Anterior</button>
        </li>
        <li class="page-item" v-for="page in totalPagesRet" :key="page" :class="{ active: page === currentPageRet }">
          <button class="page-link" @click="goToPageRet(page)">{{ page }}</button>
        </li>
        <li class="page-item" :class="{ disabled: currentPageRet === totalPagesRet }">
          <button class="page-link" @click="goToPageRet(currentPageRet + 1)">Siguiente</button>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, inject } from 'vue'
import axios from 'axios'

// Inyectar objeto "user" y determinar si es admin (proveído desde un componente padre)
const user = inject('user')
const isAdmin = computed(() => {
  return user && user.value && user.value.role && user.value.role.toLowerCase() === 'admin'
})

// Variables reactivas para datos
const retiradas = ref([])
const vehiculos = ref([])
const tarifas = ref([])

// Objeto reactivo para el formulario de retirada
const retirada = ref({
  idvehiculos: '',
  nombre: '',
  nif: '',
  domicilio: '',
  poblacion: '',
  provincia: '',
  permiso: '',
  fecha: '',
  agente: '',
  importeretirada: '',
  importedeposito: '',
  total: '',
  opcionespago: ''
})

const mostrarFormulario = ref(false)
const mensajeExito = ref('')
const modalExito = ref(false)

// Variables para modales de eliminación
const modalEliminar = ref(false)
const retiradaAEliminar = ref(null)

// Paginación para retiradas
const currentPageRet = ref(1)
const itemsPerPageRet = ref(parseInt(localStorage.getItem('itemsPerPageRet')) || 10)
const itemsPerPageOptionsRet = [5, 10, 25, 50]

watch(itemsPerPageRet, (newVal) => {
  localStorage.setItem('itemsPerPageRet', newVal)
})

const totalPagesRet = computed(() => Math.ceil(retiradas.value.length / itemsPerPageRet.value))
const paginatedRetiradas = computed(() => {
  const start = (currentPageRet.value - 1) * itemsPerPageRet.value
  return retiradas.value.slice(start, start + itemsPerPageRet.value)
})

// Computed para filtrar vehículos disponibles (estado "En depósito")
const vehiculosDisponibles = computed(() =>
  vehiculos.value.filter(v => v.estado === 'En depósito')
)

// Objeto para errores de validación
const errors = ref({
  idvehiculos: "",
  nombre: "",
  nif: "",
  domicilio: "",
  poblacion: "",
  provincia: "",
  permiso: "",
  opcionespago: "",
  total: ""
})

// Función para obtener la fecha/hora actual en formato "YYYY-MM-DD HH:mm:ss"
function getFechaActual(dateObj) {
  const year = dateObj.getFullYear()
  const month = String(dateObj.getMonth() + 1).padStart(2, '0')
  const day = String(dateObj.getDate()).padStart(2, '0')
  const hours = String(dateObj.getHours()).padStart(2, '0')
  const minutes = String(dateObj.getMinutes()).padStart(2, '0')
  const seconds = String(dateObj.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// Función para formatear fecha; si contiene "T", se convierte
function formatDate(fecha) {
  if (!fecha) return 'N/A'
  if (fecha.includes('T')) {
    const d = new Date(fecha)
    return getFechaActual(d)
  }
  return fecha
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

// Función para cargar tarifas desde el backend
async function cargarTarifas() {
  try {
    const { data } = await axios.get('/tarifas')
    tarifas.value = data
  } catch (error) {
    console.error('Error al cargar tarifas:', error)
  }
}

// Función para cargar retiradas desde el backend
async function cargarRetiradas() {
  try {
    const { data } = await axios.get('/retiradas')
    retiradas.value = data
  } catch (error) {
    console.error('Error al cargar retiradas:', error)
  }
}

onMounted(async () => {
  await cargarVehiculos()
  await cargarTarifas()
  await cargarRetiradas()
})

// Cuando se selecciona un vehículo, autocompletar campos y calcular importes
async function onVehiculoChange() {
  const veh = vehiculos.value.find(v => v.id == retirada.value.idvehiculos)
  if (veh) {
    retirada.value.agente = veh.agente
    const now = new Date()
    retirada.value.fecha = getFechaActual(now)
    const tarifa = tarifas.value.find(t => t.tipo_vehiculo === veh.tipovehiculo)
    if (tarifa) {
      retirada.value.importedeposito = tarifa.costo_base.toFixed(2)
      const fechaEntrada = new Date(veh.fechaentrada)
      const diffMinutes = (now - fechaEntrada) / (1000 * 60)
      let diffHoras = diffMinutes / 60 - tarifa.horas_gratis
      if (diffHoras < 0) diffHoras = 0
      diffHoras = Math.ceil(diffHoras)
      const importeRetirada = diffHoras * tarifa.costo_hora_extra
      retirada.value.importeretirada = importeRetirada.toFixed(2)
      retirada.value.total = (parseFloat(tarifa.costo_base) + importeRetirada).toFixed(2)
    } else {
      retirada.value.importedeposito = '0.00'
      retirada.value.importeretirada = '0.00'
      retirada.value.total = '0.00'
    }
  }
}

// Función de validación del formulario
function validarRetirada() {
  let valido = true;
  errors.value = {
    idvehiculos: "",
    nombre: "",
    nif: "",
    domicilio: "",
    poblacion: "",
    provincia: "",
    permiso: "",
    opcionespago: "",
    total: ""
  };

  if (!retirada.value.idvehiculos) {
    errors.value.idvehiculos = "Debes seleccionar un vehículo.";
    valido = false;
  }
  if (!retirada.value.nombre.trim()) {
    errors.value.nombre = "El campo Nombre no puede estar vacío.";
    valido = false;
  }
  if (!retirada.value.nif.trim()) {
    errors.value.nif = "El campo NIF no puede estar vacío.";
    valido = false;
  } else {
    const nifRegex = /^\d{8}[A-Za-z]$/;
    if (!nifRegex.test(retirada.value.nif.trim())) {
      errors.value.nif = "El NIF debe tener 8 dígitos seguidos de una letra (ej. 12345678Z).";
      valido = false;
    }
  }
  if (!retirada.value.domicilio.trim()) {
    errors.value.domicilio = "El campo Domicilio no puede estar vacío.";
    valido = false;
  }
  if (!retirada.value.poblacion.trim()) {
    errors.value.poblacion = "El campo Población no puede estar vacío.";
    valido = false;
  }
  if (!retirada.value.provincia.trim()) {
    errors.value.provincia = "El campo Provincia no puede estar vacío.";
    valido = false;
  }
  if (!retirada.value.permiso) {
    errors.value.permiso = "Debes seleccionar un permiso.";
    valido = false;
  }
  if (!retirada.value.opcionespago) {
    errors.value.opcionespago = "Debes seleccionar una opción de pago.";
    valido = false;
  }
  if (editModeRet.value && !retirada.value.total) {
    errors.value.total = "El campo Total es obligatorio en modo edición.";
    valido = false;
  }
  return valido;
}

// Función para guardar la retirada (POST o PUT)
const editModeRet = ref(false)
async function guardarRetirada() {
  if (!validarRetirada()) return;
  try {
    if (editModeRet.value && retirada.value.idvehiculos) {
      await axios.put(`/retiradas/${retirada.value.idvehiculos}`, retirada.value)
      mensajeExito.value = 'Retirada editada exitosamente.'
    } else {
      await axios.post('/retiradas', retirada.value)
      mensajeExito.value = 'Retirada registrada exitosamente.'
    }
    modalExito.value = true;
    setTimeout(() => {
      modalExito.value = false;
      cancelarRetirada();
      cargarRetiradas();
    }, 2000);
  } catch (error) {
    console.error('Error al guardar retirada:', error)
  }
}

// Función para cancelar y limpiar el formulario de retirada
function cancelarRetirada() {
  mostrarFormulario.value = false;
  mensajeExito.value = '';
  modalExito.value = false;
  editModeRet.value = false;
  errors.value = {
    idvehiculos: "",
    nombre: "",
    nif: "",
    domicilio: "",
    poblacion: "",
    provincia: "",
    permiso: "",
    opcionespago: "",
    total: ""
  };
  retirada.value = {
    idvehiculos: '',
    nombre: '',
    nif: '',
    domicilio: '',
    poblacion: '',
    provincia: '',
    permiso: '',
    fecha: '',
    agente: '',
    importeretirada: '',
    importedeposito: '',
    total: '',
    opcionespago: ''
  };
}

// Función para alternar la visualización del formulario
function toggleFormulario() {
  mostrarFormulario.value = !mostrarFormulario.value;
  if (!mostrarFormulario.value) {
    cancelarRetirada();
  }
}

// Función para editar una retirada
function editarRetirada(ret) {
  retirada.value = { ...ret };
  editModeRet.value = true;
  mostrarFormulario.value = true;
}

// Función para mostrar modal de eliminación
function mostrarModalEliminar(ret) {
  retiradaAEliminar.value = ret;
  modalEliminar.value = true;
}

// Función para cerrar el modal de eliminación
function cerrarModalEliminar() {
  modalEliminar.value = false;
  retiradaAEliminar.value = null;
}

// Función para confirmar la eliminación
async function confirmarEliminar() {
  if (!retiradaAEliminar.value) return;
  try {
    await axios.delete(`/retiradas/${retiradaAEliminar.value.idvehiculos}`);
    cerrarModalEliminar();
    mensajeExito.value = 'Retirada eliminada exitosamente.';
    modalExito.value = true;
    setTimeout(() => {
      modalExito.value = false;
      cargarRetiradas();
    }, 2000);
  } catch (error) {
    console.error('Error al eliminar retirada:', error);
  }
}

// Función para generar factura (abre una nueva pestaña con el PDF)
function generarFactura(ret) {
  window.open(`http://localhost:3000/api/retiradas/${ret.idvehiculos}/factura`, '_blank');
}

// Función para obtener la matrícula de un vehículo a partir de su ID
function getMatriculaById(idVehiculo) {
  const veh = vehiculos.value.find(v => v.id == idVehiculo);
  return veh ? veh.matricula : 'N/A';
}

// Función para cerrar los modales al hacer clic en el fondo
function cerrarModalGlobal() {
  modalExito.value = false;
  modalEliminar.value = false;
}

// Función para la paginación de retiradas
function goToPageRet(page) {
  if (page >= 1 && page <= totalPagesRet.value) {
    currentPageRet.value = page;
  }
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
