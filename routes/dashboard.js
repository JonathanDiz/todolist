import fs from 'fs';
import express from 'express';

const server = express();
const router = express.Router();

router.get("/users/dashboard", checkNotAuthenticated, (req, res) => {
  const dir = "../views";
  fs.readdir(dir, (err, files) => {
    if (err) {
      console.error("No se pudo leer el directorio: ", err);
      return res
        .status(500)
        .send("Ocurrió un error al intentar leer el directorio.");
    }
    res.render("../views/dashboard.ejs", { files });
  });
});

router.post('/users/dashboard', (req, res) => {
  const { tarea } = req.body;
  console.log("tarea: ", tarea);
  console.log(req.user);
})

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    return res.redirect("/users/login");
  }
}

export default function dashboard(){
  server.use('/users/dashboard', router);
};