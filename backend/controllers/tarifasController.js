// backend/controllers/tarifasController.js
const db = require('../models/db');

exports.getTarifas = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM tarifas');
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener tarifas:', error);
    res.status(500).json({ message: 'Error al obtener tarifas' });
  }
};
