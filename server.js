const express = require("express");
const next = require("next");
const bcrypt = require("bcrypt");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const inizializePassport = require("./passportConfig");
const { pool } = require("./dbConfig");
const helmet = require("helmet");
const fs = require("fs");
const dotenv = require("dotenv");
dotenv.config();

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();
const PORT = process.env.PORT || 3000;

inizializePassport(passport);

const server = express();

// control de errores
process.on("uncaughtException", (err) => {
  console.error("Excepción no capturada: ", err);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error("Promesa rechazada no capturada: ", err);
  process.exit(1);
});

// Middlewares
server.use(helmet());
server.use(express.json());
server.use(express.urlencoded({ extended: false }));
server.set("view engine", "ejs");
server.use(express.static('path/to/public'));
server.use(function (err, req, res, next) {
  console.error(err.stack);
  req.flash("error_msg", "Ha ocurrido un error inesperado.");
  res.redirect("/");
});

server.use(
  session({
    secret: process.env.SESSION_SECRET || "IntoDarken007+_+007+_+",
    resave: false,
    saveUninitialized: false,
  })
);
server.use(express.static("assets"));
server.use(flash());
server.use(passport.initialize());
server.use(passport.session());

// Routes

server.get("/view/:file", (req, res) => {
  const file = `./views/${req.params.file}`;
  fs.readFile(file, "utf8", (err, data) => {
    if (err) {
      console.error("No se pudo leer el archivo: ", err);
      return res.status(500).send("Ocurrió un error al intentar leer el archivo.");
    }
    res.render("view", { content: data, file });
  });
});


server.get("/", (req, res) => {
  const dir = "./views";
    fs.readdir(dir, (err, files) => {
        if (err) {
            console.error("No se pudo leer el directorio: ", err);
            return res.status(500).send("Ocurrió un error al intentar leer el directorio.");
        }
        res.render("index", { files });
    });
});

server.get("/users/register", (req, res) => {
  const dir = "./views";
    fs.readdir(dir, (err, files) => {
        if (err) {
            console.error("No se pudo leer el directorio: ", err);
            return res.status(500).send("Ocurrió un error al intentar leer el directorio.");
        }
        res.render("register", { files });
    });
});

server.get("/users/login", checkAuthenticated, (req, res) => {
  const dir = "./views";
    fs.readdir(dir, (err, files) => {
        if (err) {
            console.error("No se pudo leer el directorio: ", err);
            return res.status(500).send("Ocurrió un error al intentar leer el directorio.");
        }
        res.render("login", { files });
    });
});

server.get("/dashboard", checkNotAuthenticated, (req, res) => {
  const dir = "./views";
    fs.readdir(dir, (err, files) => {
        if (err) {
            console.error("No se pudo leer el directorio: ", err);
            return res.status(500).send("Ocurrió un error al intentar leer el directorio.");
        }
        res.render("dashboard", { files });
    });
});

server.get("/users/logout", checkAuthenticated, (req, res) => {
  req.logout();
  req.flash("success_msg", "Sesión finalizada");
  res.redirect("/users/login");
});

server.post("/users/register", async (req, res) => {
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

server.post(
  "/users/login",
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true,
  })
);

server.post("/users/register", (req, res) => {
  // Access form data
  const { usuario, nombre, correo, password } = req.body;
  
  // Hash the password
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);
  
  // Insert data into the database
  pool.query(
    `INSERT INTO users (username, name, email, password) VALUES ($1, $2, $3, $4) RETURNING email, password`,
    [usuario, nombre, correo, hash],
    (err, result) => {
      if (err) {
        req.flash("error_msg", "Error al registrar usuario");
        res.redirect("/users/register");
        return;
      }
      req.flash("success_msg", "Usuario registrado correctamente");
      res.redirect("/users/login");
    }
  );
});


app.prepare().then(() => {
  server.get("/p/:id", (req, res) => {
    const actualPage = "/post";
    const queryParams = { id: req.params.id };
    handle(req, res, actualPage, queryParams);
  });

  server.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`Server listening on port ${PORT}`);
  });
});

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/dashboard");
  }
  next();
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    return res.redirect("/users/login");
  }
}
