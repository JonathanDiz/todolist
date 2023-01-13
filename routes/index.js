import fs from 'fs';
import express from 'express';

const server = express();
const router = express.Router();

router.get("/", (req, res) => {
  const dir = "../views";
  fs.readdir(dir, (err, files) => {
    if (err) {
      console.error("No se pudo leer el directorio: ", err);
      return res
        .status(500)
        .send("Ocurrió un error al intentar leer el directorio.");
    }
    res.render("/views/index.ejs", { files });
  });
});

export default function index(){
  server.use('/', router);
};