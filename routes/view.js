import fs from "fs";
import express from "express";

const server = express();
const router = express.Router();

router.get("/view/:file", (req, res) => {
  const file = ` ../views/${req.params.file}`;
  fs.readFile(file, "utf8", (err, data) => {
    if (err) {
      console.error("No se pudo leer el archivo: ", err);
      return res
        .status(500)
        .send("Ocurrió un error al intentar leer el archivo.");
    }
    res.render("view", { content: data, file });
  });
});

export default function view() {
  server.use("/view", router);
}
