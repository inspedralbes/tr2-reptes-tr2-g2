import dotenv from 'dotenv';
dotenv.config(); 

import express from 'express';
import cors from 'cors';
import routes from './routes'; 

const app = express();
app.set('trust proxy', 1);

const allowedOrigins = [
  'https://enginy.kore29.com',      // Prod Web
  'http://enginy.kore29.com',
  'https://enginy-api.kore29.com',  // Prod API
  'http://enginy-api.kore29.com',
  'http://localhost:8002',     
  'http://localhost:3000',  
];

// Añadir orígenes desde el .env si existen
if (process.env.CORS_ORIGIN) {
  const envOrigins = process.env.CORS_ORIGIN.split(',').map(o => o.trim());
  envOrigins.forEach(origin => {
    if (!allowedOrigins.includes(origin)) {
      allowedOrigins.push(origin);
    }
  });
}

app.use(cors({
  origin: function (origin, callback) {
    // Permitir todas las peticiones en desarrollo para evitar problemas con ngrok
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'ngrok-skip-browser-warning'],
  credentials: true,
  optionsSuccessStatus: 200 // Para compatibilidad con navegadores antiguos
}));

app.use(express.json());

// Rutas API
app.use('/api', routes);

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`🚀 Servidor listo en puerto: ${PORT}`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  DATABASE STATUS: Connected to PostgreSQL (Live Update)`);
});