const LocalStrategy = require("passport-local").Strategy;
const { pool } = require("./dbConfig");
const bcrypt = require("bcrypt");

function inizialize(passport) {
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true
      },
      async (req, email, password, done) => {
        try {
          const user = await pool.query("SELECT * from users WHERE email = $1", [
            email
          ]);
          if (user.rows.length === 0) {
            return done(null, false, { message: "Correo Electrónico no registrado" });
          }
          const isMatch = await bcrypt.compare(password, user.rows[0].password);
          if (!isMatch) {
            return done(null, false, { message: "Contraseña inválida" });
          }
          return done(null, user.rows[0]);
        } catch (err) {
          done(err);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
      done(null, user.rows[0]);
    } catch (err) {
      done(err);
    }
  });
}

module.exports = inizialize
