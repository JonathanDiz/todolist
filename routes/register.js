import fs from 'fs';
import bcrypt from "bcrypt";
import { pool } from "../dbConfig.js";
import express from "express";

const server = express();
const router = express.Router();

router.get("/users/register", (req, res) => {
  const dir = "../views";
  fs.readdir(dir, (err, files) => {
    if (err) {
      console.error("No se pudo leer el directorio: ", err);
      return res
        .status(500)
        .send("Ocurrió un error al intentar leer el directorio.");
    }
    res.render("/views/register", { files });
  });
});

router.post("/users/register", async (req, res) => {
  const { usuario, name, email, password, password2 } = req.body;
  let errors = [];

  if (!usuario || !name || !email || !password || !password2) {
    errors.push({ message: "Por favor llene todos los campos" });
  }

  if (password !== password2) {
    errors.push({ message: "Las contraseñas no coinciden" });
  }

  if (errors.length > 0) {
    res.render("register", { errors });
  } else {
    try {
      const user = await pool.query("SELECT * FROM users WHERE email = $1", [
        email,
      ]);
      if (user.rows.length > 0) {
        errors.push({
          message: "El usuario ya existe, por favor inicie sesión",
        });
        res.render("register", { errors });
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
          "INSERT INTO users (usuario, name, email, password) VALUES ($1, $2, $3, $4)",
          [usuario, name, email, hashedPassword]
        );
        req.flash("success_msg", "Cuenta creada con éxito");
        res.redirect("/users/login");
      }
    } catch (error) {
      console.error(error);
      res.redirect("/users/register");
    }
  }
});

router.post("/users/register", (req, res) => {
  // Access form data
  const { usuario, nombre, correo, password } = req.body;

  // Hash the password
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);

  // Insert data into the database
  pool.query(
    `SELECT * FROM users 
      WHERE email = $1`,
    [email],
    (err, result) => {
      if (err) {
        throw err;
      }
      console.log(result.rows);
      if (result.rows.length > 0) {
        errors.push({
          message: "El usuario ya existe, por favor inicie sesion",
        });
        res.render("register", { errors });
      } else {
        pool.query(
          `INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, password`,
          [name, email, encriptPassword],
          (err, result) => {
            if (err) {
              throw err;
            }
            console.log(result.rows);
            req.flash(
              "success_msg",
              "Cuenta creada con exito, ahora puede iniciar sesion."
            );
            res.redirect("/users/login");
          }
        );
      }
    }
  );
});

export default function register(){
  server.use('/users/register', router);
};