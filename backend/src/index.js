require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectToDb } = require('./config/database');
const routes = require('./routes');

// Initialize the app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Mount the routes
app.use('/', routes);

const PORT = process.env.PORT;
connectToDb((err) => {
  if (!err) {
    app.listen(PORT, () => {
      console.log(`Servidor escuchando en el puerto ${PORT}`);
    });
  } else {
    console.log('No se pudo iniciar el servidor por error en DB', err);
    process.exit(1);
  }
});
