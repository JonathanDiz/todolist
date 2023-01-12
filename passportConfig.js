const LocalStrategy = require("passport-local").Strategy;
const { pool } = require("./dbConfig");
const bcrypt = require("bcrypt");

function inizialize(passport) {
  const authenticateUser = (email, password, relize) => {
    pool.query(
      `SELECT * FROM users WHERE email = $1`,
      [email],
      (err, result) => {
        if (err) {
          throw err;
        }
        console.log(result.rows);

        if (result.rows.length > 0) {
          const user = result.rows[0];

          bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
              throw err;
            }
            if (isMatch) {
              return relize(null, user);
            } else {
              return relize(null, false, {
                message: "Contraseña invalida",
              });
            }
          });
        } else {
          return relize(null, false, {
            message: "Correo Electrónico no registrado",
          });
        }
      }
    );
  };

  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      authenticateUser
    )
  );
  passport.serializeUser((user, relize) => relize(null, user.id));

  passport.deserializeUser((id, relize) => {
    pool.query(`SELECT * FROM users WHERE id = $1`, [id], (err, result) => {
      if (err) {
        throw err;
      }
      return relize(null, result.rows[0]);
    });
  });
}

module.exports = inizialize;