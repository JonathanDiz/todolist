require("dotenv").config();
const { Pool } = require("pg");

const config = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  password: process.env.DB_PASSWORD.toString(),
  database: process.env.DB_NAME,
};

const pool = new Pool(config);

pool.connect((err, client, release) => {
  if (err) {
    return console.error("Error al conectar con la base de datos", err.stack);
  }
  console.log("conectado a la base de datos");
});

module.exports = { pool };

