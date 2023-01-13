import express from "express";
import next from "next";
import session from "express-session";
import flash from "express-flash";
import passport from "passport";
import inizializePassport from "./passportConfig.js";
import helmet from "helmet";
import dashboard from "./routes/dashboard.js";
import index from "./routes/index.js";
import login from "./routes/login.js";
import logout from "./routes/logout.js";
import register from "./routes/register.js";
import path from 'path';
import view from "./routes/view.js";
import dotenv from "dotenv";
dotenv.config();
import { URL } from "url";
const __dirname = new URL(import.meta.url).pathname;

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
server.use(express.static(path.join(__dirname, 'public')));
server.use(function (err, req, res, next) {
  console.error(err.stack);
  req.flash("error_msg", "Ha ocurrido un error inesperado.");
  res.redirect("/");
});

server.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
  })
);
server.use(flash());
server.use(passport.initialize());
server.use(passport.session());

// Routes
view();
index();
login();
register();
dashboard();
logout();

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
