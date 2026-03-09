import mysql from 'mysql2/promise';

const db = mysql.createPool({
  host: 'localhost',
  user: 'adm_db',      
  password: 'admin',
  database: 'sistema', 
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default db;
