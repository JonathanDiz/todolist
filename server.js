import express from "express";
import next from "next";
import session from "express-session";
import flash from "express-flash";
import passport from "passport";
import inizializePassport from "./passportConfig.js";
import helmet from "helmet";
import path from "path";
import dotenv from "dotenv";
dotenv.config();
import { URL } from "url";
const __dirname = new URL(import.meta.url).pathname;

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();
const PORT = process.env.PORT || 3000;

const server = express();
const router = express.Router();

inizializePassport(passport);

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
server.use(express.static(path.join(__dirname, "public")));
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

// Importar y aplicar rutas
import dashboard from "./routes/dashboard.js";
import index from "./routes/index.js";
import login from "./routes/login.js";
import logout from "./routes/logout.js";
import register from "./routes/register.js";
import view from "./routes/view.js";

view(router);
index(router);
login(router, passport);
register(router, passport);
dashboard(router, passport);
logout(router);

server.use("view/:file", router);
server.use("/", router);
server.use("/users/login", router, passport.authenticate);
server.use("/users/register", router, passport.authenticate);
server.use("/dashboard", router, passport.authenticate);
server.use("/users/logout", router);

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
