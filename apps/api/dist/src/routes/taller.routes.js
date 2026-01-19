"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const tallerController = __importStar(require("../controllers/taller.controller"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const validateMiddleware_1 = require("../middlewares/validateMiddleware");
const taller_schema_1 = require("../schemas/taller.schema");
// GET /api/tallers - Listar todos los talleres (público o protegido, según decidas)
router.get('/', tallerController.getTallers);
// GET /api/tallers/:id - Detalle de un taller
router.get('/:id', tallerController.getTallerById);
// POST /api/tallers - Crear taller (Solo Admin)
router.post('/', authMiddleware_1.authenticateToken, authMiddleware_1.isAdmin, (0, validateMiddleware_1.validateData)(taller_schema_1.createTallerSchema), tallerController.createTaller);
// PUT /api/tallers/:id - Editar taller
router.put('/:id', authMiddleware_1.authenticateToken, authMiddleware_1.isAdmin, (0, validateMiddleware_1.validateData)(taller_schema_1.updateTallerSchema), tallerController.updateTaller);
// DELETE /api/tallers/:id - Borrar taller
router.delete('/:id', authMiddleware_1.authenticateToken, authMiddleware_1.isAdmin, tallerController.deleteTaller);
exports.default = router;
