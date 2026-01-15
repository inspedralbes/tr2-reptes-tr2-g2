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

// Rutas API
app.use('/api', routes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor listo en puerto: ${PORT}`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  Sistema DB: Prisma + MySQL`);
});