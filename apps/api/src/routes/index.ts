import express from 'express';
const router = express.Router();

// Importar archivos de rutas individuales
import authRoutes from './auth.routes';
import tallerRoutes from './taller.routes';
import centroRoutes from './centro.routes';
import peticioRoutes from './peticio.routes'; // Nueva ruta para el flujo de reservas
import assignacioRoutes from './assignacio.routes';
import alumneRoutes from './alumne.routes';
import professorRoutes from './professor.routes';
import calendarRoutes from './calendar.routes';
import faseRoutes from './fase.routes';
import statsRoutes from './stats.routes';
import sectorRoutes from './sector.routes';
import assistenciaRoutes from './assistencia.routes';

// --- Definir las rutas base ---

// Rutas de Autenticación (Login, Registro)
router.use('/auth', authRoutes);

// Rutas de Maestros
router.use('/tallers', tallerRoutes);
router.use('/centres', centroRoutes);
router.use('/sectors', sectorRoutes);

// Rutas del Flujo de Negocio (Solicitudes y Asignaciones)
router.use('/peticions', peticioRoutes);
router.use('/assignacions', assignacioRoutes);

// Rutas de Alumnos y Profesores
router.use('/alumnes', alumneRoutes);
router.use('/professors', professorRoutes);
router.use('/assistencia', assistenciaRoutes);

// Rutas de Calendario
router.use('/calendar', calendarRoutes);
router.use('/fases', faseRoutes);

// Rutas de Estadísticas (MongoDB)
router.use('/stats', statsRoutes);

// Health Check (Para ver si la API respira)
router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

export default router;