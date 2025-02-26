<template>
  <div class="logs-container">
    <h1>Historial de Logs</h1>

    <!-- Filtros de búsqueda -->
    <div class="filters">
      <input type="text" v-model="searchUser" placeholder="Buscar por usuario">
      <input type="date" v-model="searchDate">
      <button @click="applyFilters">Buscar</button>
    </div>

    <table class="logs-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>User ID</th>
          <th>Username</th>
          <th>Acción</th>
          <th>Fecha/Hora</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="log in logs" :key="log.id">
          <td>{{ log.id }}</td>
          <td>{{ log.user_id }}</td>
          <td>{{ log.username }}</td>
          <td>{{ log.action }}</td>
          <td>{{ log.timestamp }}</td>
        </tr>
      </tbody>
    </table>

    <!-- Controles de paginación -->
    <div class="pagination">
      <button @click="prevPage" :disabled="page <= 1">Anterior</button>
      <span>Página {{ page }} de {{ totalPages }}</span>
      <button @click="nextPage" :disabled="page >= totalPages">Siguiente</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'Logs',
  data() {
    return {
      logs: [],
      page: 1,
      limit: 10,
      totalPages: 1,
      searchUser: '',
      searchDate: ''
    }
  },
  created() {
    this.fetchLogs();
  },
  methods: {
    async fetchLogs() {
      try {
        // Construimos los parámetros de búsqueda
        const params = {
          page: this.page,
          limit: this.limit
        };
        if (this.searchUser) params.searchUser = this.searchUser;
        if (this.searchDate) params.searchDate = this.searchDate;
        
        // Se asume que el baseURL está configurado como "http://localhost:3000/api"
        const response = await axios.get('/logs', { params });
        
        // Asignamos los datos recibidos y la información de paginación
        this.logs = response.data.data;
        this.totalPages = response.data.pagination.totalPages;
      } catch (error) {
        console.error("Error al obtener los logs:", error);
      }
    },
    nextPage() {
      if (this.page < this.totalPages) {
        this.page++;
        this.fetchLogs();
      }
    },
    prevPage() {
      if (this.page > 1) {
        this.page--;
        this.fetchLogs();
      }
    },
    applyFilters() {
      // Reiniciamos a la primera página cuando se aplican filtros nuevos
      this.page = 1;
      this.fetchLogs();
    }
  }
}
</script>

<style scoped>
.logs-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.filters {
  margin-bottom: 20px;
}

.filters input {
  margin-right: 10px;
  padding: 5px;
}

.filters button {
  padding: 5px 10px;
}

.logs-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.logs-table th,
.logs-table td {
  padding: 10px;
  border: 1px solid #ddd;
  text-align: left;
}

.pagination {
  margin-top: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pagination button {
  padding: 5px 10px;
  margin: 0 10px;
}
</style>
