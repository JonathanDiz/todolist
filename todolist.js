const input = document.querySelector("input");
const addBtn = document.querySelector(".btn-add");
const ul = document.querySelector("ul");
const empty = document.querySelector("empty");
const { Client } = require('pg');

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

client.connect((err) => {
  if (err) {
    console.error('Error al conectarse a la base de datos:', err.stack);
  } else {
    console.log('Conectado a la base de datos.');
  }
});


addBtn.addEventListener("click", (e) => {
  e.preventDefault();

  const text = input.value;

  if (text !== "") {
    const li = document.createElement("li");
    const p = document.createElement("p");
    p.textContent = text;

    li.appendChild(p);
    li.appendChild(addDeleteBtn());
    ul.appendChild(li);

    input.value = "";
    empty.style.display = "none";

    addBtn.addEventListener("click", (e) => {
      e.preventDefault();
    
      const tarea = input.value;
    
      if (tarea !== "") {
        client.query('INSERT INTO tareas (tarea, estado) VALUES ($1, $2)', [tarea, false], (err, res) => {
          if (err) {
            console.error(err.stack);
          } else {
            console.log(res.rows);
          }
        });
      }
    });    
  }
});

function addDeleteBtn() {
  const deleteBtn = document.createElement("button");

  deleteBtn.textContent = "Delete";
  deleteBtn.className = "btn-delete";

  deleteBtn.addEventListener("click", (e) => {
    const item = e.target.parentElement;
    ul.removeChild(item);

    const items = document.querySelectorAll("li");

    if (items.length === 0) {
      empty.style.display = "block";
    }
    deleteBtn.addEventListener("click", (e) => {
      const tarea = e.target.parentElement;
      const id = tarea.getAttribute('data-id');
    
      client.query('DELETE FROM tareas WHERE id = $1', [id], (err, res) => {
        if (err) {
          console.error(err.stack);
        } else {
          console.log(res.rows);
        }
      });
    
      ul.removeChild(tarea);
    
      const items = document.querySelectorAll("li");
    
      if (items.length === 0) {
        empty.style.display = "block";
      }
    });    
  });
  return deleteBtn;
}
