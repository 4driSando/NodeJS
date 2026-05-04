const express = require('express');
const mysql = require('mysql2');

const app = express();
const port = 3000;

// Configuración de la conexión a MySQL
const db = mysql.createConnection({
  host: 'db', // Nombre del servicio en docker-compose
  user: 'root',
  password: 'root',
  database: 'mi_base',
  port: 3306
});

// Conectar a la base de datos
db.connect((err) => {
  if (err) {
    console.error('Error conectando a la base de datos:', err);
    return;
  }
  console.log('Conectado a la base de datos MySQL');
});

// Middleware para parsear JSON
app.use(express.json());

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: '¡Hola desde Node.js en Docker!' });
});

// Ruta para obtener datos de la base de datos
app.get('/api/data', (req, res) => {
  db.query('SELECT * FROM information_schema.tables LIMIT 5', (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Error en la consulta' });
      return;
    }
    res.json({ data: results });
  });
});

// Ruta para verificar conexión a DB
app.get('/api/health', (req, res) => {
  db.query('SELECT 1', (err) => {
    if (err) {
      res.status(500).json({ status: 'Database connection failed' });
    } else {
      res.json({ status: 'OK', database: 'connected' });
    }
  });
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});