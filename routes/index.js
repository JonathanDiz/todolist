import fs from 'fs';
import express from 'express';


const router = express.Router();

router.get("/", (req, res) => {
  const dir = path.join(__dirname, '..', 'views');
  fs.readdir(dir, (err, files) => {
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
