require("dotenv").config();
const { Pool } = require("pg");

const config = {
  user: "postgres",
  host: "localhost",
  password: "IntoDarken007+_+007+_+",
  database: "todolist",
};

const pool = new Pool(config);

module.exports = { pool };
