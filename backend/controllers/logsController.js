// controllers/logsController.js
const db = require('../models/db');

exports.getLogs = async (req, res) => {
  // Extraemos los parámetros de paginación y filtros desde la query
  let { page, limit, searchUser, searchDate } = req.query;
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;
  const offset = (page - 1) * limit;

  // Base de la consulta y para obtener el total de registros
  let baseQuery = "SELECT id, user_id, username, action, timestamp FROM logs";
  let countQuery = "SELECT COUNT(*) as total FROM logs";
  const conditions = [];
  const values = [];

  // Agregamos condición para filtrar por usuario (username)
  if (searchUser) {
    conditions.push("username LIKE ?");
    values.push(`%${searchUser}%`);
  }

  // Agregamos condición para filtrar por fecha (suponiendo que searchDate tiene formato 'YYYY-MM-DD')
  if (searchDate) {
    conditions.push("DATE(timestamp) = ?");
    values.push(searchDate);
  }

  // Si hay condiciones, se añaden a las consultas
  if (conditions.length > 0) {
    const whereClause = " WHERE " + conditions.join(" AND ");
    baseQuery += whereClause;
    countQuery += whereClause;
  }

  // Agregamos el orden y la paginación a la consulta principal
  baseQuery += " ORDER BY timestamp DESC LIMIT ? OFFSET ?";
  values.push(limit, offset);

  try {
    // Ejecutamos la consulta principal
    const [logs] = await db.query(baseQuery, values);
    // Ejecutamos la consulta para contar el total de registros sin limit y offset
    const [countResult] = await db.query(countQuery, values.slice(0, conditions.length));
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    res.json({
      data: logs,
      pagination: {
        total,
        page,
        totalPages
      }
    });
  } catch (err) {
    console.error('Error al obtener los logs:', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};