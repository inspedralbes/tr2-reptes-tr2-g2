const express = require('express');
const router = express.Router();

// Importar archivos de rutas individuales
const authRoutes = require('./auth.routes');
const tallerRoutes = require('./taller.routes');
const centroRoutes = require('./centro.routes');
const peticioRoutes = require('./peticio.routes'); // Nueva ruta para el flujo de reservas
const alumneRoutes = require('./alumne.routes');

// --- Definir las rutas base ---

// Rutas de Autenticación (Login, Registro)
router.use('/auth', authRoutes);

// Rutas de Maestros
router.use('/tallers', tallerRoutes);
router.use('/centres', centroRoutes);

// Rutas del Flujo de Negocio (Solicitudes y Asignaciones)
router.use('/peticions', peticioRoutes);

// Rutas de Alumnos e Inscripciones
router.use('/alumnes', alumneRoutes);

// Health Check (Para ver si la API respira)
router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

module.exports = router;