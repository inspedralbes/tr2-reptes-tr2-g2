const express = require('express');
const { connectToDb, getDb } = require('./database');

// Inicializar la app y middleware
const app = express();
app.use(express.json());

// Conexión a la base de datos
let db;

connectToDb((err) => {
  if (!err) {
    // Si la conexión es exitosa, levantamos el servidor
    app.listen(3000, () => {
      console.log(' Servidor escuchando en el puerto 3000');
    });
    db = getDb();
  } else {
    console.log(" No se pudo iniciar el servidor por error en DB");
  }
});

// --- RUTA DE PRUEBA (Para ver si funciona) ---
app.get('/talleres', async (req, res) => {
  try {
    // Ejemplo de consulta nativa (sin Mongoose)
    const talleres = await db.collection('tallers').find().toArray();
    res.status(200).json(talleres);
  } catch (error) {
    res.status(500).json({ error: "Error al buscar talleres" });
  }
});