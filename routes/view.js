import fs from "fs";
import express from "express";
import path from "path";

const viewsDir = path.relative(process.cwd(), path.join(path.dirname(new URL(import.meta.url).pathname), 'views'));
const router = express.Router();

router.get("/view/:file", (req, res) => {
  fs.readFile(viewsDir, file, "utf8", (err, data) => {
    if (err) {
      console.error("No se pudo leer el archivo: ", err);
      return res
        .status(500)
        .send("Ocurrió un error al intentar leer el archivo.");
    }
    res.render("view", { content: data, file });
  });
});

export default function view(app) {
  app.use("/view", router);
}
