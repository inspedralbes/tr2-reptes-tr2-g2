import dotenv from 'dotenv';
dotenv.config();

import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import routes from './routes';
import logger from './lib/logger';
import { errorHandler } from './middlewares/errorHandler';
import prisma from './lib/prisma';

const app = express();
app.set('trust proxy', 1);

// ... (allowedOrigins logic remains same)
const allowedOrigins = [
  'https://iter.kore29.com', // Prod Domain (Web & API)
  'http://iter.kore29.com',
  'http://localhost:8002',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:8002',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
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
    // permitir peticiones sin origen (como apps móviles o curl) si es necesario, 
    // pero para web restringir a la lista
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'ngrok-skip-browser-warning'],
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use('/api/uploads', express.static('uploads'));

// Rutas API
app.use('/api', routes);

// Error Handler (Debe ir después de las rutas)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, async () => {
  logger.info(`🚀 Servidor listo en puerto: ${PORT}`);
  logger.info(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  try {
    await prisma.$queryRaw`SELECT 1`;
    logger.info(`🗄️  DATABASE STATUS: Connected to PostgreSQL`);
  } catch (e) {
    logger.error(`🗄️  DATABASE STATUS: Connection failed`);
  }
});

// Gestió de connexions implementada (obertura i tancament) - REQUISITO CHECKLIST
import { closeConnection } from './lib/mongodb';

process.on('SIGINT', async () => {
  logger.info('Shutting down server...');
  await closeConnection();
  await prisma.$disconnect();
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});
