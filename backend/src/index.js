const express = require('express');
const { connectToDb } = require('./config/database');
const routes = require('./routes');

// Initialize the app
const app = express();

// Middleware
app.use(express.json());

// Mount the routes
app.use('/', routes);

// Connect to the database and start the server
connectToDb((err) => {
  if (!err) {
    app.listen(3000, () => {
      console.log('Servidor escuchando en el puerto 3000');
    });
  } else {
    console.log('No se pudo iniciar el servidor por error en DB', err);
    process.exit(1);
  }
});
