const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '6364',
  database: 'tienda_tecnologia'
});

module.exports = pool;