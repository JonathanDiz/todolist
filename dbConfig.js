require("dotenv").config();
const { Pool } = require("pg");

const config = {
usuario: process.env.DB_USER,
host: process.env.DB_HOST,
contraseña: process.env.DB_PASSWORD,
database: process.env.DB_DATABASE,
};

const pool = new Pool(config);

pool.connect((err, client, release) => {
if (err) {
return console.error("Error al conectar con la base de datos", err.stack);
}
console.log("conectado a la base de datos");
});

module.exports = { pool };

