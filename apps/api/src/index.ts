import dotenv from 'dotenv';
dotenv.config();

import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import routes from './routes';
import logger from './lib/logger';
import { errorHandler } from './middlewares/errorHandler';

const app = express();
app.set('trust proxy', 1);

// ... (allowedOrigins logic remains same)
const allowedOrigins = [
  'https://iter.kore29.com', // Prod Web
  'http://iter.kore29.com',
  'https://iter-api.kore29.com', // Prod API
  'http://iter-api.kore29.com',
  'http://localhost:8002',
  'http://localhost:3000',
];

if (process.env.CORS_ORIGIN) {
  const envOrigins = process.env.CORS_ORIGIN.split(',').map((o) => o.trim());
  envOrigins.forEach((origin) => {
    if (!allowedOrigins.includes(origin)) {
      allowedOrigins.push(origin);
    }
  });
}

app.use(cors({
  origin: function (origin, callback) {
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'ngrok-skip-browser-warning'],
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(express.json());

// Rutas API
app.use('/api', routes);

// Error Handler (Debe ir después de las rutas)
app.use(errorHandler);

const PORT = process.env.PORT || 8002;

app.listen(PORT, () => {
  logger.info(`🚀 Servidor listo en puerto: ${PORT}`);
  logger.info(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🗄️  DATABASE STATUS: Connected to PostgreSQL (Live Update)`);
});
