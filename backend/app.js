/* snipetcode: backend/app.js */
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const tarifasRoutes = require('./routes/tarifasRoutes');
// ...
const app = express();
app.use(express.json());

// Habilitar CORS para que el frontend (puerto 5173) pueda acceder
app.use(cors({
  origin: 'http://localhost:5173', // Puerto donde corre tu Vue
  credentials: true
}));

// Configuración de conexión (para express-session)
const dbOptions = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'proyecto_final_vue'
};
const sessionStore = new MySQLStore(dbOptions);

app.use(session({
  key: 'session_cookie_name',
  secret: 'mi_secreto_para_sesiones',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,  // true si usas HTTPS
    httpOnly: true,
    maxAge: 1000 * 60 * 60 // 1 hora
  }
}));

// Rutas (importadas de routes/)
const authRoutes = require('./routes/authRoutes');
const usuariosRoutes = require('./routes/usuariosRoutes');
const vehiculosRoutes = require('./routes/vehiculosRoutes');
const retiradasRoutes = require('./routes/retiradasRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/vehiculos', vehiculosRoutes);
app.use('/api/retiradas', retiradasRoutes);
app.use('/api/tarifas', tarifasRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Backend del sistema de gestión de grúa municipal');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
