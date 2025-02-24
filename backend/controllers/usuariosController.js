/* snipetcode: backend/controllers/usuariosController.js */
const db = require('../models/db');

exports.getUsuarios = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM users');
    res.json(rows);
  } catch (error) {
    console.error('[GET USUARIOS ERROR]', error);
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
};

exports.createUsuario = async (req, res) => {
  try {
    const { username, password, role } = req.body;
    await db.execute(
      'INSERT INTO users (username, password, role) VALUES (?,?,?)',
      [username, password, role]
    );
    res.status(201).json({ message: 'Usuario creado correctamente' });
  } catch (error) {
    console.error('[CREATE USUARIO ERROR]', error);
    res.status(500).json({ message: 'Error al crear usuario' });
  }
};

exports.updateUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, role } = req.body;
    await db.execute(
      'UPDATE users SET username=?, password=?, role=? WHERE id=?',
      [username, password, role, id]
    );
    res.json({ message: 'Usuario actualizado correctamente' });
  } catch (error) {
    console.error('[UPDATE USUARIO ERROR]', error);
    res.status(500).json({ message: 'Error al actualizar usuario' });
  }
};

exports.deleteUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute('DELETE FROM users WHERE id=?', [id]);
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('[DELETE USUARIO ERROR]', error);
    res.status(500).json({ message: 'Error al eliminar usuario' });
  }
};
