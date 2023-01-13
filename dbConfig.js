import dotenv from "dotenv";
dotenv.config();
import pkg from "pg";
const { Pool } = pkg;

const config = {
  user: process.env.DB_USER,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  host: process.env.DB_HOST,
  max:  process.env.DB_MAX,
  idleTimeoutMillis: process.env.DB_IDLE_TIMEOUT_MILLIS,
  connectionTimeoutMllis: process.env.DB_CONNECTION_TIMEOUT_MILLIS,
};

const pool = new Pool(config);

pool.connect((err, client, release) => {
  if (err) {
    return console.error("Error al conectar con la base de datos", err.stack);
  }
  console.log("conectado a la base de datos");
});

export { pool };

