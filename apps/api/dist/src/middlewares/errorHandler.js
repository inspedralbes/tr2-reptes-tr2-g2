"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const logger_1 = __importDefault(require("../lib/logger"));
const errorHandler = (err, req, res, next) => {
    logger_1.default.error(`${err.message} - ${req.method} ${req.url} - IP: ${req.ip}`);
    if (err.name === 'ZodError') {
        return res.status(400).json({
            error: 'Error de validación',
            details: err.errors,
        });
    }
    // Errores conocidos de Prisma
    if (err.code?.startsWith('P')) {
        return res.status(400).json({
            error: 'Error en la base de datos',
            message: err.message,
        });
    }
    const statusCode = err.status || 500;
    res.status(statusCode).json({
        error: statusCode === 500 ? 'Error interno del servidor' : err.message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};
exports.errorHandler = errorHandler;
