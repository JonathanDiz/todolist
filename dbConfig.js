require("dotenv").config();
const { Pool } = require("pg");

const config = {
  user: "postgres",
  host: "localhost",
  password: "IntoDarken007+_+007+_+",
  database: "todolist",
};

const pool = new Pool(config);

pool.connect((err, client, release) => {
  if (err) {
  return console.error("Error al conectar con la base de datos", err.stack)
  }
  console.log("conectado a la base de datos");
  });
  
  

module.exports = { pool };
