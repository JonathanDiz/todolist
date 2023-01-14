import fs from "fs";
import bcrypt from "bcrypt";
import { pool } from "../dbConfig.js";
import express from "express";
import path from "path";

const viewsDir = path.relative(process.cwd(), path.join(path.dirname(new URL(import.meta.url).pathname), 'views'));
const router = express.Router();

router.get("/users/register", (req, res) => {
  fs.readdir(viewsDir, (err, files) => {
    if (err) {
      console.error("No se pudo leer el directorio: ", err);
      return res
        .status(500)
        .send("Ocurrió un error al intentar leer el directorio.");
    }
    res.render("/views/register.ejs", { files });
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

export default function register(app) {
  app.use("/users/register", router);
}
