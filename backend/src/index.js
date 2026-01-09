require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectToDb } = require('./config/database');
const routes = require('./routes');

// Initialize the app
const app = express();

// Middleware
app.use(cors({
  origin: [process.env.EXPO_PUBLIC_API_URL, 'http://localhost:8081', 'http://localhost:19006'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning']
}));
app.use(express.json());

// Mount the routes
app.use('/api', routes);

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
