import fs from 'fs';
import express from 'express';
import passport from 'passport';

const server = express();
const router = express.Router();

router.get("/users/login", checkAuthenticated, (req, res) => {
  const dir = "../views";
  fs.readdir(dir, (err, files) => {
    if (err) {
      console.error("No se pudo leer el directorio: ", err);
      return res
        .status(500)
        .send("Ocurrió un error al intentar leer el directorio.");
    }
    res.render("/views/login.ejs", { files });
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


export default function login(){
  server.use('/users/login', router);
};