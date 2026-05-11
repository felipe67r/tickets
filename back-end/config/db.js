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
db.getConnection()
  .then(conn => {
    console.log("Conexão com o MariaDB estabelecida com sucesso!");
    conn.release(); 
  })
  .catch(err => {
    console.error("ERRO AO CONECTAR NO MARIADB:", err.message);
  });

export default db;
