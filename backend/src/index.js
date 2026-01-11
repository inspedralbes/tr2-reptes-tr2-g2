require('dotenv').config(); 

const express = require('express');
const cors = require('cors');
const { connectToDb } = require('./config/database');
const routes = require('./routes');

const app = express();
app.set('trust proxy', 1);

const allowedOrigins = [
  'https://enginy.kore29.com',      // Tu Web en Producción (Cloudflare)
  'http://enginy.kore29.com',       // Por si acaso entra por HTTP
  'https://enginy-api.kore29.com',  // Tu API en Producción (Cloudflare)
  'http://enginy-api.kore29.com',   // Por si acaso entra por HTTP
  'http://localhost:8081',          // Tu entorno local (Expo Web)
  'http://localhost:8002',          // Tu Frontend Docker en local
  'http://192.168.1.39:8081'        // Tu IP local para pruebas
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'La política CORS no permite acceso desde este origen.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning'],
  credentials: true 
}));

app.use(express.json());
app.use('/api', routes);

connectToDb((err) => {
  if (!err) {
    app.listen(PORT, () => {
      console.log(`🚀 Servidor: ${process.env.PORT}`);
      console.log(`🌍 Ambiente: ${process.env.NODE_ENV}`);
    });
  } else {
    console.error('❌ Error fatal: No se pudo conectar a la base de datos', err);
    process.exit(1);
  }
});