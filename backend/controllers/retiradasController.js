/* snipetcode: backend/controllers/retiradasController.js */
const db = require('../models/db');
/* snipetcode: Generar PDF en retiradasController.js */
const PDFDocument = require('pdfkit');
exports.getRetiradaPDF = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.execute('SELECT * FROM retiradas WHERE Id=?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Retirada no encontrada' });
    }
    const retirada = rows[0];

    // Configurar cabeceras HTTP
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=retirada_${id}.pdf`);

    // Generar PDF con pdfkit
    const doc = new PDFDocument();
    doc.pipe(res);

    doc.fontSize(16).text('Comprobante de Retirada', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`ID Retirada: ${retirada.Id}`);
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

// Si NO usas tabla tarifas:
const tarifasStatic = {
  'Motocicleta, aperos, motocarros y similares': 25,
  'Turismo hasta 12 cv ó Remolques hasta 750 kg': 100,
  'Turismos más de 12 cv ó Remolques más de 750 kg': 130,
  'Vehículos especiales': 150,
  'Vehículos de cortesía': 0,
  'Chatarra': 0
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

    // 2) Cálculo de costo base
    // Opción A: usando objeto static:
    let costoBase = tarifasStatic[vehiculo.tipovehiculo] || 0;

    // Opción B (parte extra): leer de la tabla tarifas
    /*
    let [tarifaRows] = await db.execute('SELECT * FROM tarifas WHERE tipo_vehiculo=? LIMIT 1', [vehiculo.tipovehiculo]);
    if (tarifaRows.length > 0) {
      const t = tarifaRows[0];
      costoBase = t.costo_base;
    }
    */

    // 3) Cálculo de horas en depósito
    const fechaEntrada = new Date(vehiculo.fechaentrada);
    const fechaSalida = new Date(); // al retirar
    const diffMs = fechaSalida - fechaEntrada;
    const diffHoras = Math.ceil(diffMs / (1000 * 60 * 60));

    // Ejemplo: 1 hora gratis y 10€/hora adicional
    let horasGratis = 1;
    let costePorHoraExtra = 10;

    // Si usas tabla tarifas con columns: horas_gratis, costo_hora_extra
    /*
    if (tarifaRows.length > 0) {
      horasGratis = tarifaRows[0].horas_gratis;
      costePorHoraExtra = tarifaRows[0].costo_hora_extra;
    }
    */

    const horasCobrar = diffHoras > horasGratis ? diffHoras - horasGratis : 0;
    const importedeposito = horasCobrar * costePorHoraExtra;

    // 4) Calcular total
    const total = costoBase + importedeposito;

    // 5) Insertar la retirada
    await db.execute(
      `INSERT INTO retiradas
        (idvehiculos, nombre, nif, domicilio, poblacion, provincia,
         permiso, fecha, agente, importeretirada, importedeposito,
         total, opcionespago)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        idvehiculos, nombre, nif, domicilio, poblacion, provincia,
        permiso, new Date(), agente, costoBase, importedeposito,
        total, opcionespago
      ]
    );

    // 6) Actualizar vehículo (fecha salida y estado)
    await db.execute(
      `UPDATE vehiculos
       SET fechasalida=?, estado='Liquidado'
       WHERE id=?`,
      [fechaSalida, idvehiculos]
    );

    // 7) Log
    await db.execute(
      'INSERT INTO logs (usuario, accion, fecha) VALUES (?,?,NOW())',
      [req.session.user?.username || 'Desconocido', `Retirada de vehículo ${idvehiculos}`]
    );

    res.status(201).json({ message: 'Retirada registrada', total });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear retirada' });
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
