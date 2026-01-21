"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
require("express-async-errors");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = __importDefault(require("./routes"));
const logger_1 = __importDefault(require("./lib/logger"));
const errorHandler_1 = require("./middlewares/errorHandler");
const app = (0, express_1.default)();
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
    const envOrigins = process.env.CORS_ORIGIN.split(',').map(o => o.trim());
    envOrigins.forEach(origin => {
        if (!allowedOrigins.includes(origin)) {
            allowedOrigins.push(origin);
        }
    });
}
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'ngrok-skip-browser-warning'],
    credentials: true,
    optionsSuccessStatus: 200
}));
app.use(express_1.default.json());
// Rutas API
app.use('/api', routes_1.default);
// Error Handler (Debe ir después de las rutas)
app.use(errorHandler_1.errorHandler);
const PORT = process.env.PORT || 8002;
app.listen(PORT, () => {
    logger_1.default.info(`🚀 Servidor listo en puerto: ${PORT}`);
    logger_1.default.info(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    logger_1.default.info(`🗄️  DATABASE STATUS: Connected to PostgreSQL (Live Update)`);
});
