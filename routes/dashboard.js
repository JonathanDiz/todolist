import fs from 'fs';
import express from 'express';
import path from 'path';

const viewsDir = path.relative(process.cwd(), path.join(path.dirname(new URL(import.meta.url).pathname), 'views'));
const router = express.Router();

router.get("/users/dashboard", checkNotAuthenticated, (req, res) => {
  fs.readdir(viewsDir, (err, files) => {
    if (err) {
      console.error("No se pudo leer el directorio: ", err);
      return res
        .status(500)
        .send("Ocurrió un error al intentar leer el directorio.");
    }
    res.render("dashboard", { files });
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

export default function dashboard(app){
  app.use('/users/dashboard', router);
};
