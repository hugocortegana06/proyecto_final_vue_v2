const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const path = require('path'); // Añade esta línea

// Importación de rutas
const tarifasRoutes = require('./routes/tarifasRoutes');
const logRoutes = require('./routes/logRoutes');
const authRoutes = require('./routes/authRoutes');
const usuariosRoutes = require('./routes/usuariosRoutes');
const vehiculosRoutes = require('./routes/vehiculosRoutes');
const retiradasRoutes = require('./routes/retiradasRoutes');

const app = express();

// Habilitar CORS (ajusta para producción después)
app.use(cors({
  origin: true, // Acepta cualquier origen por ahora
  credentials: true
}));

// Middleware para parsear JSON
app.use(express.json());

// Sirve los archivos estáticos de dist (ubicado en la raíz)
app.use(express.static(path.join(__dirname, '../dist')));

// Ruta para manejar todas las solicitudes no capturadas por las APIs
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

// Configuración de conexión para express-session
const dbOptions = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'proyecto_final_vue'
};
const sessionStore = new MySQLStore(dbOptions);

app.use(session({
  key: 'session_cookie_name',
  secret: 'mi_secreto_para_sesiones',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 1000 * 60 * 60
  }
}));

// Definir las rutas
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/vehiculos', vehiculosRoutes);
app.use('/api/retiradas', retiradasRoutes);
app.use('/api/tarifas', tarifasRoutes);
app.use('/api', logRoutes);

app.get('/', (req, res) => {
  res.send('Backend del sistema de gestión de grúa municipal');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});