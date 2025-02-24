/* snipetcode: backend/models/db.js */
const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'proyecto_final_vue'
});

module.exports = pool.promise();
