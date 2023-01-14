import fs from 'fs';
import express from 'express';
import passport from 'passport';
import path from "path";

const viewsDir = path.relative(process.cwd(), path.join(path.dirname(new URL(import.meta.url).pathname), 'views'));
const router = express.Router();

router.get("/users/login", checkAuthenticated, (req, res) => {
  fs.readdir(viewsDir, (err, files) => {
    if (err) {
      console.error("No se pudo leer el directorio: ", err);
      return res
        .status(500)
        .send("Ocurrió un error al intentar leer el directorio.");
    }
    res.render("login", { files });
  });
});

router.post(
  "/users/login",
  passport.authenticate("local", {
    successRedirect: "/users/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true,
  })
);

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/users/dashboard");
  }
  next();
}


export default function login(app){
  app.use('/users/login', router);
};