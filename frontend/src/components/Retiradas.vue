<template>
  <div class="container mt-5">
    <h2 class="mb-4 text-primary">Gestión de Retiradas</h2>
    
    <!-- Botón para mostrar/ocultar el formulario de nueva retirada -->
    <button class="btn btn-success mb-3" @click="toggleFormulario">
      {{ mostrarFormulario ? 'Ocultar Formulario' : 'Añadir Retirada' }}
    </button>
    
    <!-- Formulario para añadir nueva retirada -->
    <div v-if="mostrarFormulario" class="card mb-3">
      <div class="card-body">
        <h5 class="card-title">Nueva Retirada</h5>
        <form @submit.prevent="guardarRetirada">
          <!-- Selección de vehículo (por matrícula, solo vehículos en "En depósito") -->
          <div class="mb-3">
            <label for="vehiculoSelect" class="form-label">Selecciona Matrícula del Vehículo:</label>
            <select
              id="vehiculoSelect"
              v-model="retirada.idvehiculos"
              class="form-select"
              @change="onVehiculoChange"
              required
            >
              <option value="">-- Selecciona un vehículo --</option>
              <option
                v-for="veh in vehiculosDisponibles"
                :key="veh.id"
                :value="veh.id"
              >
                {{ veh.matricula }}
              </option>
            </select>
          </div>

          <!-- Campos a rellenar manualmente -->
          <div class="mb-3">
            <label class="form-label">Nombre</label>
            <input type="text" v-model="retirada.nombre" class="form-control" placeholder="Ingresa nombre" required>
          </div>
          <div class="mb-3">
            <label class="form-label">NIF</label>
            <input type="text" v-model="retirada.nif" class="form-control" placeholder="Ingresa NIF" required>
          </div>
          <div class="mb-3">
            <label class="form-label">Domicilio</label>
            <input type="text" v-model="retirada.domicilio" class="form-control" placeholder="Ingresa domicilio" required>
          </div>
          <div class="mb-3">
            <label class="form-label">Población</label>
            <input type="text" v-model="retirada.poblacion" class="form-control" placeholder="Ingresa población" required>
          </div>
          <div class="mb-3">
            <label class="form-label">Provincia</label>
            <input type="text" v-model="retirada.provincia" class="form-control" placeholder="Ingresa provincia" required>
          </div>
          <!-- Permiso: desplegable -->
          <div class="mb-3">
            <label class="form-label">Permiso</label>
            <select v-model="retirada.permiso" class="form-select" required>
              <option value="">-- Selecciona permiso --</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>
          </div>
          <!-- Fecha actual (no editable) -->
          <div class="mb-3">
            <label class="form-label">Fecha</label>
            <input type="text" v-model="retirada.fecha" class="form-control" disabled>
          </div>
          <!-- Agente: autocompletado según el vehículo seleccionado -->
          <div class="mb-3">
            <label class="form-label">Agente</label>
            <input type="text" v-model="retirada.agente" class="form-control" disabled>
          </div>
          <!-- Importe Depósito: autocompletado desde la tarifa -->
          <div class="mb-3">
            <label class="form-label">Importe Depósito</label>
            <input type="text" v-model="retirada.importedeposito" class="form-control" disabled>
          </div>
          <!-- Importe Retirada: calculado -->
          <div class="mb-3">
            <label class="form-label">Importe Retirada</label>
            <input type="text" v-model="retirada.importeretirada" class="form-control" disabled>
          </div>
          <!-- Total: suma de ambos importes -->
          <div class="mb-3">
            <label class="form-label">Total</label>
            <input type="text" v-model="retirada.total" class="form-control" disabled>
          </div>
          <!-- Opción de Pago: desplegable -->
          <div class="mb-3">
            <label class="form-label">Opción de Pago</label>
            <select v-model="retirada.opcionespago" class="form-select" required>
              <option value="">-- Selecciona opción --</option>
              <option value="Tarjeta">Tarjeta</option>
              <option value="Efectivo">Efectivo</option>
            </select>
          </div>
          <button type="submit" class="btn btn-primary">Guardar Retirada</button>
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
        </tr>
      </thead>
      <tbody>
        <tr v-for="retiro in retiradas" :key="retiro.Id">
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
        </tr>
      </tbody>
    </table>
    <div v-else>
      <p>No hay retiradas registradas.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'

// Variables reactivas
const vehiculos = ref([])
const tarifas = ref([])
const retiradas = ref([])

// Estructura del formulario de retirada
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

// Computed para filtrar solo vehículos en "En depósito"
const vehiculosDisponibles = computed(() =>
  vehiculos.value.filter(v => v.estado === 'En depósito')
)

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

// Función para formatear fecha (de 'YYYY-MM-DD HH:mm:ss' a 'DD/MM/YYYY HH:mm')
function formatDate(fecha) {
  if (!fecha) return 'N/A'
  try {
    const [datePart, timePart] = fecha.split(' ')
    const [year, month, day] = datePart.split('-')
    const [hours, minutes] = timePart.split(':')
    return `${day}/${month}/${year} ${hours}:${minutes}`
  } catch (e) {
    return fecha
  }
}

// Cargar vehículos desde el backend
async function cargarVehiculos() {
  try {
    const { data } = await axios.get('/vehiculos')
    vehiculos.value = data
  } catch (error) {
    console.error('Error al cargar vehículos:', error)
  }
}

// Cargar tarifas desde el backend
async function cargarTarifas() {
  try {
    const { data } = await axios.get('/tarifas')
    tarifas.value = data
  } catch (error) {
    console.error('Error al cargar tarifas:', error)
  }
}

// Cargar retiradas desde el backend
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

// Cuando se selecciona un vehículo, autocompletar campos
function onVehiculoChange() {
  const veh = vehiculos.value.find(v => v.id == retirada.value.idvehiculos)
  if (veh) {
    // Asigna el agente del vehículo
    retirada.value.agente = veh.agente
    // Asigna la fecha actual
    const now = new Date()
    retirada.value.fecha = getFechaActual(now)
    // Buscar tarifa correspondiente (igualar tipovehiculo con tipo_vehiculo)
    const tarifa = tarifas.value.find(t => t.tipo_vehiculo === veh.tipovehiculo)
    if (tarifa) {
      // Importe Depósito es el costo_base
      retirada.value.importedeposito = tarifa.costo_base.toFixed(2)
      // Calcular diferencia en horas entre la fecha actual y la fecha de entrada del vehículo
      const fechaEntrada = new Date(veh.fechaentrada)
      let diffHoras = (now - fechaEntrada) / (1000 * 3600)
      // Restar las horas gratis (si el resultado es negativo, se usa 0)
      diffHoras = Math.max(0, diffHoras - tarifa.horas_gratis)
      const importeRetirada = diffHoras * tarifa.costo_hora_extra
      retirada.value.importeretirada = importeRetirada.toFixed(2)
      // Total es la suma de ambos importes
      retirada.value.total = (parseFloat(tarifa.costo_base) + importeRetirada).toFixed(2)
    } else {
      retirada.value.importedeposito = '0.00'
      retirada.value.importeretirada = '0.00'
      retirada.value.total = '0.00'
    }
  }
}

// Guardar la retirada (POST)
async function guardarRetirada() {
  try {
    await axios.post('/retiradas', retirada.value)
    alert('Retirada registrada exitosamente.')
    cancelarRetirada()
    cargarRetiradas()
  } catch (error) {
    console.error('Error al guardar retirada:', error)
  }
}

// Cancelar y limpiar el formulario de retirada
function cancelarRetirada() {
  mostrarFormulario.value = false
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
  }
}

// Alternar la visualización del formulario
function toggleFormulario() {
  mostrarFormulario.value = !mostrarFormulario.value
  if (!mostrarFormulario.value) {
    cancelarRetirada()
  }
}

// Función para obtener la matrícula de un vehículo a partir de su ID
function getMatriculaById(idVehiculo) {
  const veh = vehiculos.value.find(v => v.id == idVehiculo)
  return veh ? veh.matricula : 'N/A'
}
</script>

<style scoped>
.table {
  margin-top: 20px;
}
</style>
