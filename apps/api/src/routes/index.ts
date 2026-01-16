import express from 'express';
const router = express.Router();

// Importar archivos de rutas individuales
import authRoutes from './auth.routes';
import tallerRoutes from './taller.routes';
import centroRoutes from './centro.routes';
import peticioRoutes from './peticio.routes'; // Nueva ruta para el flujo de reservas
import assignacioRoutes from './assignacio.routes';
import alumneRoutes from './alumne.routes';
import calendarRoutes from './calendar.routes';

// --- Definir las rutas base ---

// Rutas de Autenticación (Login, Registro)
router.use('/auth', authRoutes);

// Rutas de Maestros
router.use('/tallers', tallerRoutes);
router.use('/centres', centroRoutes);

// Rutas del Flujo de Negocio (Solicitudes y Asignaciones)
router.use('/peticions', peticioRoutes);
router.use('/assignacions', assignacioRoutes);

// Rutas de Alumnos e Inscripciones
router.use('/alumnes', alumneRoutes);

// Rutas de Calendario
router.use('/calendar', calendarRoutes);

// Health Check (Para ver si la API respira)
router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

export default router;