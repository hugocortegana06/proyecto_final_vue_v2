/* snipetcode: backend/controllers/authController.js */
const db = require('../models/db');
const bcrypt = require('bcrypt');

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    // Seleccionar la columna role
    const [rows] = await db.execute(
      'SELECT id, username, role, password FROM users WHERE username=?',
      [username]
    );
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }
    const user = rows[0];
    console.log("Datos obtenidos del usuario:", user); // Verifica que aparezca 'role'

    // Comparación de contraseñas (usa bcrypt.compare si están encriptadas)
    if (user.password !== password) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    // Guarda en la sesión la información del usuario, transformando el role a minúsculas si lo deseas
    req.session.user = {
      id: user.id,
      username: user.username,
      role: (user.role || '').toLowerCase()
    };

    // Devolver también en la respuesta
    return res.json({ message: 'Login exitoso', user: req.session.user });
  } catch (error) {
    console.error('[LOGIN ERROR]', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};


exports.logout = (req, res) => {
  const userSession = req.session.user;
  if (!userSession) {
    console.log('No hay sesión activa');
    return res.json({ message: 'No hay sesión activa' });
  }
  
  console.log('Cerrando sesión para:', userSession);
  
  req.session.destroy((err) => {
    if (err) {
      console.error('Error al destruir la sesión:', err);
      // Si ocurre un error, podemos intentar forzar el logout
      res.clearCookie('session_cookie_name');
      return res.status(500).json({ message: 'Error al cerrar sesión' });
    }
    
    console.log('Sesión destruida correctamente');
    res.clearCookie('session_cookie_name');
    res.json({ message: 'Logout exitoso (sin insertar log)' });
  });
};



exports.isLoggedIn = (req, res) => {
  if (req.session.user) {
    return res.json({ loggedIn: true, user: req.session.user });
  } else {
    return res.json({ loggedIn: false, user: null });
  }
};
