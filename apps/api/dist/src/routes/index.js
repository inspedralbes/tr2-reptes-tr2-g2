"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
// Importar archivos de rutas individuales
const auth_routes_1 = __importDefault(require("./auth.routes"));
const taller_routes_1 = __importDefault(require("./taller.routes"));
const centro_routes_1 = __importDefault(require("./centro.routes"));
const peticio_routes_1 = __importDefault(require("./peticio.routes")); // Nueva ruta para el flujo de reservas
const assignacio_routes_1 = __importDefault(require("./assignacio.routes"));
const alumne_routes_1 = __importDefault(require("./alumne.routes"));
const professor_routes_1 = __importDefault(require("./professor.routes"));
const calendar_routes_1 = __importDefault(require("./calendar.routes"));
const fase_routes_1 = __importDefault(require("./fase.routes"));
const stats_routes_1 = __importDefault(require("./stats.routes"));
const sector_routes_1 = __importDefault(require("./sector.routes"));
const assistencia_routes_1 = __importDefault(require("./assistencia.routes"));
const notificacio_routes_1 = __importDefault(require("./notificacio.routes"));
// --- Definir las rutas base ---
// Rutas de Autenticación (Login, Registro)
router.use('/auth', auth_routes_1.default);
// Rutas de Maestros
router.use('/tallers', taller_routes_1.default);
router.use('/centres', centro_routes_1.default);
router.use('/sectors', sector_routes_1.default);
// Rutas del Flujo de Negocio (Solicitudes y Asignaciones)
router.use('/peticions', peticio_routes_1.default);
router.use('/assignacions', assignacio_routes_1.default);
router.use('/notificacions', notificacio_routes_1.default);
// Rutas de Alumnos y Profesores
router.use('/alumnes', alumne_routes_1.default);
router.use('/professors', professor_routes_1.default);
router.use('/assistencia', assistencia_routes_1.default);
// Rutas de Calendario
router.use('/calendar', calendar_routes_1.default);
router.use('/fases', fase_routes_1.default);
// Rutas de Estadísticas (MongoDB)
router.use('/stats', stats_routes_1.default);
// Health Check (Para ver si la API respira)
router.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
});
exports.default = router;
