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

exports.getFacturaPDF = async (req, res) => {
  const { id } = req.params; // Se espera que 'id' sea el valor de idvehiculos
  try {
    // Obtener la retirada (usamos idvehiculos, suponiendo que es único)
    const [rows] = await db.execute('SELECT * FROM retiradas WHERE idvehiculos=?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Retirada no encontrada' });
    }
    const ret = rows[0];

    // (Opcional) Obtener datos del vehículo asociado para incluir más información
    const [vehRows] = await db.execute('SELECT * FROM vehiculos WHERE id=?', [ret.idvehiculos]);
    const veh = vehRows.length > 0 ? vehRows[0] : {};

    // Generar número de expediente aleatorio de 8 dígitos
    const randomNum = Math.floor(Math.random() * 90000000) + 10000000; // Número de 8 dígitos
    // Obtener los últimos dos caracteres del DNI (nif): último dígito y letra
    const dniSuffix = ret.nif ? ret.nif.slice(-2) : '';
    const expediente = `${randomNum}-${dniSuffix}`;

    // Configurar cabeceras para PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=factura_${id}.pdf`);

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    doc.pipe(res);

    // Encabezado con el número de expediente generado
    doc.fontSize(16).text(`Número Expediente - ${expediente}`, { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text('La Policía Local ha procedido a retirar el vehículo que se detalla a continuación, en cumplimiento de la Ordenanza Municipal reguladora.', {
      align: 'center'
    });
    doc.moveDown();

    // Datos del vehículo
    doc.fontSize(14).text('DATOS DEL VEHÍCULO', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12)
      .text(`Matrícula: ${veh.matricula || 'N/A'}`)
      .text(`Marca: ${veh.marca || 'N/A'}`)
      .text(`Modelo: ${veh.modelo || 'N/A'}`)
      .text(`Lugar de recogida: ${veh.lugar || 'N/A'}`)
      .text(`Fecha de entrada: ${veh.fechaentrada ? veh.fechaentrada : 'N/A'}`);
    doc.moveDown();

    // Datos del propietario (usando datos de la retirada)
    doc.fontSize(14).text('DATOS DEL PROPIETARIO', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12)
      .text(`Nombre: ${ret.nombre || 'N/A'}`)
      .text(`NIF: ${ret.nif || 'N/A'}`)
      .text(`Domicilio: ${ret.domicilio || 'N/A'}`)
      .text(`Población: ${ret.poblacion || 'N/A'}`)
      .text(`Provincia: ${ret.provincia || 'N/A'}`);
    doc.moveDown();

    // Datos de entrega
    doc.fontSize(14).text('DATOS DE ENTREGA', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12)
      .text(`Agente: ${ret.agente || 'N/A'}`)
      .text(`Fecha de retirada: ${ret.fecha || 'N/A'}`);
    doc.moveDown();

    // Importes
    doc.fontSize(14).text('IMPORTES', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12)
      .text(`Importe Retirada: ${ret.importeretirada} €`)
      .text(`Importe Depósito: ${ret.importedeposito} €`)
      .text(`Total a pagar: ${ret.total} €`);
    doc.moveDown();

    // Datos de pago
    doc.fontSize(14).text('FORMA DE PAGO', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12)
      .text(`Opción de Pago: ${ret.opcionespago || 'N/A'}`);
    doc.moveDown();

    // Pie de página
    doc.fontSize(10).text('Factura generada el ' + new Date().toLocaleString(), { align: 'center' });
    
    doc.end();
  } catch (error) {
    console.error("Error al generar factura PDF:", error);
    res.status(500).json({ message: 'Error al generar factura PDF', error: error.message });
  }
};


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
exports.updateRetirada = async (req, res) => {
  // Asumimos que la ruta está definida como: router.put('/:id', ...),
  // y que el parámetro "id" corresponde al valor de idvehiculos.
  const { id } = req.params;
  try {
    const [result] = await db.execute(
      `UPDATE retiradas SET
         nombre = ?, nif = ?, domicilio = ?, poblacion = ?, provincia = ?,
         permiso = ?, total = ?, opcionespago = ?
       WHERE idvehiculos = ?`,
      [
        req.body.nombre,
        req.body.nif,
        req.body.domicilio,
        req.body.poblacion,
        req.body.provincia,
        req.body.permiso,
        req.body.total,
        req.body.opcionespago,
        id
      ]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Retirada no encontrada' });
    }
    res.json({ message: 'Retirada actualizada' });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar retirada', error: error.message });
  }
};

