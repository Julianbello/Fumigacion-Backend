const sql = require("mssql");

const config = {
  server: process.env.AZURE_SQL_SERVER,
  database: process.env.AZURE_SQL_DATABASE,
  user: process.env.AZURE_SQL_USER,
  password: process.env.AZURE_SQL_PASSWORD,
  port: Number(process.env.AZURE_SQL_PORT) || 1433,
  options: {
    encrypt: true,
    trustServerCertificate: false
  },
  pool: { max: 10, min: 0, idleTimeoutMillis: 30000 }
};

let poolPromise = null;

function getPool() {
  if (!poolPromise) {
    poolPromise = new sql.ConnectionPool(config)
      .connect()
      .then((pool) => {
        console.log("Conectado a Azure SQL correctamente");
        return pool;
      })
      .catch((err) => {
        poolPromise = null;
        console.error("Error de conexión a Azure SQL:", err.message);
        throw err;
      });
  }
  return poolPromise;
}

module.exports = { sql, getPool };
