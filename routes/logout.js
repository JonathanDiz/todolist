import express from "express";

const server = express();
const router = express.Router();

router.get("/users/logout", checkAuthenticated, (req, res) => {
  req.logout();
  req.flash("success_msg", "Sesión finalizada");
  res.redirect("/users/login");
});

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/users/dashboard");
  }
  next();
}

export default function logout() {
  server.use("/users/logout", router);
}
