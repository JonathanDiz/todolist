const express = require("express");
const next = require("next");
const bcrypt = require("bcrypt");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const inizializePassport = require("./passportConfig");
const { pool } = require("./dbConfig");
const helmet = require("helmet");
const dotenv = require("dotenv");
dotenv.config();

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();
const PORT = process.env.PORT || 3000;

inizializePassport(passport);

const server = express();

// Middlewares
server.use(helmet());
server.use(express.json());
server.use(express.urlencoded({ extended: false }));
server.set("view engine", "ejs");

server.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
  })
);
server.use(flash());
server.use(express.static("assets"));
server.use(passport.initialize());
server.use(passport.session());

// Routes
server.get("/", (req, res) => {
  return res.render("index");
});

server.get("/users/register", (req, res) => {
  return res.render("register");
});

server.get("/users/login", checkAuthenticated, (req, res) => {
  return res.render("login");
});

server.get("/dashboard", checkNotAuthenticated, (req, res) => {
  return res.render("dashboard", { user: req.user });
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
