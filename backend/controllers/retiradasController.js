const db = require('../models/db');
const PDFDocument = require('pdfkit');

// Función auxiliar para formatear fecha a "YYYY-MM-DD HH:mm:ss"
function getMySQLDateTime(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

exports.deleteRetirada = async (req, res) => {
  console.log("req.params:", req.params);
  const { idvehiculos } = req.params; // Extraer el parámetro correctamente
  console.log("Valor recibido para eliminación (idvehiculos):", idvehiculos);
  const idNum = parseInt(idvehiculos, 10);
  console.log("Valor convertido a número:", idNum);
  try {
    const [result] = await db.execute('DELETE FROM retiradas WHERE idvehiculos=?', [idNum]);
    console.log("Filas afectadas:", result.affectedRows);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Retirada no encontrada' });
    }
    res.json({ message: 'Retirada eliminada' });
  } catch (error) {
    console.error('Error al eliminar retirada:', error);
    res.status(500).json({ message: 'Error al eliminar retirada', error: error.message });
  }
};


exports.getRetiradaPDF = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.execute('SELECT * FROM retiradas WHERE id=?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Retirada no encontrada' });
    }
    const retirada = rows[0];
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=retirada_${id}.pdf`);
    const doc = new PDFDocument();
    doc.pipe(res);
    doc.fontSize(16).text('Comprobante de Retirada', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`ID Retirada: ${retirada.id}`);
    doc.text(`Vehículo ID: ${retirada.idvehiculos}`);
    doc.text(`Nombre: ${retirada.nombre}`);
    doc.text(`NIF: ${retirada.nif}`);
    doc.text(`Fecha: ${retirada.fecha}`);
    doc.text(`Importe Retirada: ${retirada.importeretirada} €`);
    doc.text(`Importe Depósito: ${retirada.importedeposito} €`);
    doc.text(`Total: ${retirada.total} €`);
    doc.text(`Pago: ${retirada.opcionespago}`);
    doc.end();
  } catch (error) {
    res.status(500).json({ message: 'Error al generar PDF' });
  }
};

exports.createRetirada = async (req, res) => {
  const { idvehiculos, nombre, nif, domicilio, poblacion, provincia, permiso, agente, opcionespago } = req.body;
  try {
    // 1) Obtener datos del vehículo
    const [vehRows] = await db.execute('SELECT * FROM vehiculos WHERE id=?', [idvehiculos]);
    if (vehRows.length === 0) {
      return res.status(404).json({ message: 'Vehículo no encontrado' });
    }
    const vehiculo = vehRows[0];
    
    // 2) Obtener tarifa desde la BD según el tipovehiculo del vehículo
    const [tarifaRows] = await db.execute(
      'SELECT * FROM tarifas WHERE tipo_vehiculo=? LIMIT 1',
      [vehiculo.tipovehiculo]
    );
    if (tarifaRows.length === 0) {
      return res.status(404).json({ message: 'Tarifa no encontrada para el tipo de vehículo' });
    }
    const tarifa = tarifaRows[0];
    const costoBase = tarifa.costo_base;
    const horasGratis = tarifa.horas_gratis;
    const costoHoraExtra = tarifa.costo_hora_extra;
    
    // 3) Calcular diferencia de tiempo en minutos entre la fecha actual y la fecha de entrada
    const fechaEntrada = new Date(vehiculo.fechaentrada);
    const fechaSalida = new Date();
    const diffMinutes = (fechaSalida - fechaEntrada) / (1000 * 60);
    let diffHoras = diffMinutes / 60 - horasGratis;
    if (diffHoras < 0) diffHoras = 0;
    diffHoras = Math.ceil(diffHoras);
    
    // 4) Calcular importe y total
    const importeRetirada = diffHoras * costoHoraExtra;
    const total = costoBase + importeRetirada;
    
    // 5) Insertar la retirada
    await db.execute(
      `INSERT INTO retiradas 
         (idvehiculos, nombre, nif, domicilio, poblacion, provincia, permiso, fecha, agente, importeretirada, importedeposito, total, opcionespago)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        String(idvehiculos),
        nombre,
        nif,
        domicilio,
        poblacion,
        provincia,
        permiso,
        getMySQLDateTime(fechaSalida),
        agente,
        importeRetirada,
        costoBase,
        total,
        opcionespago
      ]
    );
    
    // 6) Actualizar el vehículo: asignar fecha de salida y cambiar estado a 'Liquidado'
    await db.execute(
      `UPDATE vehiculos
       SET fechasalida=?, estado='Liquidado'
       WHERE id=?`,
      [getMySQLDateTime(fechaSalida), idvehiculos]
    );
    
    // 7) Registrar el log
    await db.execute(
      'INSERT INTO logs (usuario, accion, fecha) VALUES (?,?,NOW())',
      [req.session.user?.username || 'Desconocido', `Retirada de vehículo ${idvehiculos}`]
    );
    
    res.status(201).json({ message: 'Retirada registrada', total });
  } catch (error) {
    console.error("Error al crear retirada:", error);
    res.status(500).json({ message: 'Error al crear retirada', error: error.message });
  }
};

exports.getRetiradas = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM retiradas');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener retiradas' });
  }
};
