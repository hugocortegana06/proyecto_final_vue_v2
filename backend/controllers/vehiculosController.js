const db = require('../models/db');

// Función auxiliar para formatear fechas en formato 'YYYY-MM-DD HH:mm:ss'
function formateaFecha(valor) {
  if (!valor) return null;
  if (valor.includes('T')) {
    const dt = new Date(valor);
    const year = dt.getFullYear();
    const month = String(dt.getMonth() + 1).padStart(2, '0');
    const day = String(dt.getDate()).padStart(2, '0');
    const hours = String(dt.getHours()).padStart(2, '0');
    const minutes = String(dt.getMinutes()).padStart(2, '0');
    const seconds = String(dt.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } else {
    return valor;
  }
}

/**
 * GET /api/vehiculos
 */
exports.getVehiculos = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM vehiculos');
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener vehículos:", error);
    res.status(500).json({ message: 'Error al obtener vehículos' });
  }
};

/**
 * POST /api/vehiculos
 */
exports.createVehiculo = async (req, res) => {
  try {
    console.log("Request body de crear vehículo:", req.body);
    
    let {
      fechaentrada,
      fechasalida,
      lugar,
      direccion,
      agente,
      matricula,
      marca,
      modelo,
      color,
      motivo,
      tipovehiculo,
      grua,
      estado
    } = req.body;
    
    // Estado por defecto si no se envía
    estado = estado || 'En depósito';
    
    // Formatear las fechas
    fechaentrada = formateaFecha(fechaentrada) || new Date().toISOString().slice(0, 19).replace('T', ' ');
    fechasalida = formateaFecha(fechasalida);
    
    const sql = `
      INSERT INTO vehiculos 
        (fechaentrada, fechasalida, lugar, direccion, agente,
         matricula, marca, modelo, color, motivo, tipovehiculo, grua, estado)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await db.execute(sql, [
      fechaentrada,
      fechasalida,
      lugar || null,
      direccion || null,
      agente || null,
      matricula,         // Matrícula se ingresa en el formulario
      marca || null,
      modelo || null,
      color || null,
      motivo || null,
      tipovehiculo || null,
      grua || null,
      estado
    ]);
    
    return res.json({ message: "Vehículo creado exitosamente" });
  } catch (error) {
    console.error("Error al crear vehículo:", error);
    return res.status(500).json({ message: "Error interno al crear vehículo", error: error.message });
  }
};

/**
 * PUT /api/vehiculos/:id
 */
exports.updateVehiculo = async (req, res) => {
  const { id } = req.params;
  const {
    fechaentrada, fechasalida, lugar, direccion, agente,
    matricula, marca, modelo, color,
    motivo, tipovehiculo, grua, estado
  } = req.body;
  try {
    await db.execute(
      `UPDATE vehiculos SET
        fechaentrada=?, fechasalida=?,
        lugar=?, direccion=?, agente=?,
        matricula=?, marca=?, modelo=?,
        color=?, motivo=?,
        tipovehiculo=?, grua=?, estado=?
       WHERE id=?`,
      [
        fechaentrada, fechasalida,
        lugar, direccion, agente,
        matricula, marca, modelo,
        color, motivo,
        tipovehiculo, grua, estado,
        id
      ]
    );
    // (Opcional) Inserción en logs, etc.
    return res.json({ message: 'Vehículo actualizado' });
  } catch (err) {
    console.error('Error al actualizar vehículo:', err);
    return res.status(500).json({ message: 'Error al actualizar vehículo' });
  }
};

/**
 * DELETE /api/vehiculos/:id
 */
exports.deleteVehiculo = async (req, res) => {
  const { id } = req.params;
  try {
    await db.execute('DELETE FROM vehiculos WHERE id=?', [id]);
    // Comenta la inserción en logs para aislar el problema
    // await db.execute(
    //   'INSERT INTO logs (usuario, accion, fecha) VALUES (?,?,NOW())',
    //   [req.session.user?.username || 'Desconocido', `Eliminó vehículo ${id}`]
    // );
    res.json({ message: 'Vehículo eliminado' });
  } catch (error) {
    console.error("Error al eliminar vehículo:", error);
    res.status(500).json({ message: 'Error al eliminar vehículo' });
  }
};