<template>
  <div class="logs-container">
    <h1>Historial de Logs</h1>

    <!-- Filtros de búsqueda -->
    <div class="filters">
      <input type="text" v-model="searchUser" placeholder="Buscar por usuario" />
      <input type="date" v-model="searchDate" />
      <button @click="applyFilters">Buscar</button>
      <button @click="clearFilters" class="clear-button">Limpiar filtros</button>
    </div>

    <table class="logs-table">
      <thead>
        <tr>
          <th>Username</th>
          <th>Acción</th>
          <th>Fecha/Hora</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="log in logs" :key="log.id">
          <td>{{ log.username }}</td>
          <td>{{ log.action }}</td>
          <td>{{ formatDate(log.timestamp) }}</td>
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
    };
  },
  created() {
    this.fetchLogs();
  },
  methods: {
    async fetchLogs() {
      try {
        const params = {
          page: this.page,
          limit: this.limit
        };
        if (this.searchUser) params.searchUser = this.searchUser;
        if (this.searchDate) params.searchDate = this.searchDate;
        const response = await axios.get('/logs', { params });
        // Se espera que la respuesta tenga el formato: { data: [...], pagination: { totalPages: ... } }
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
      this.page = 1;
      this.fetchLogs();
    },
    clearFilters() {
      this.searchUser = '';
      this.searchDate = '';
      this.page = 1;
      this.fetchLogs();
    },
    // Función para obtener la fecha/hora actual en formato "YYYY-MM-DD HH:mm:ss"
    getFechaActual(dateObj) {
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      const hours = String(dateObj.getHours()).padStart(2, '0');
      const minutes = String(dateObj.getMinutes()).padStart(2, '0');
      const seconds = String(dateObj.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    },
    // Formatea la fecha según el formato "YYYY-MM-DD HH:mm:ss" sin ajustes adicionales.
    formatDate(dateStr) {
      if (!dateStr) return 'N/A';
      if (dateStr.includes('T')) {
        const d = new Date(dateStr);
        return this.getFechaActual(d);
      }
      return dateStr;
    }
  }
};
</script>

<style scoped>
.logs-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  background-color: #f2f2f2;
  border-radius: 8px;
}

.filters {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.filters input,
.filters button {
  padding: 8px;
  font-size: 14px;
}

.filters button {
  background-color: #0b3d91;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.filters button:hover {
  background-color: #2e559e;
}

.clear-button {
  background-color: #e74c3c;
}

.clear-button:hover {
  background-color: #c0392b;
}

.logs-table {
  width: 100%;
  border-collapse: collapse;
  background-color: #fff;
}

.logs-table th,
.logs-table td {
  padding: 10px;
  border: 1px solid #ddd;
  text-align: left;
}

.logs-table thead {
  background-color: #0b3d91;
  color: #fff;
}

.logs-table tbody tr:nth-child(even) {
  background-color: #f9f9f9;
}

.pagination {
  margin-top: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.pagination button {
  padding: 8px 12px;
  font-size: 14px;
  background-color: #0b3d91;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.pagination button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.pagination span {
  font-size: 14px;
}
</style>
