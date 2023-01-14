import fs from 'fs';
import express from 'express';
import path from "path";

const viewsDir = path.relative(process.cwd(), path.join(path.dirname(new URL(import.meta.url).pathname), 'views'));
const router = express.Router();

router.get("/", (req, res) => {
  fs.readdir(viewsDir, (err, files) => {
    if (err) {
      console.error("No se pudo leer el directorio: ", err);
      return res
        .status(500)
        .send("Ocurrió un error al intentar leer el directorio.");
    }
    res.render("index", { files });
  });
});

export default function index(app){
  app.use('/', router);
};
