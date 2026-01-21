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
const assignacioController = __importStar(require("../controllers/assignacio.controller"));
const tetrisController = __importStar(require("../controllers/tetris.controller"));
const enrollmentController = __importStar(require("../controllers/enrollment.controller"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const multer_1 = __importDefault(require("multer"));
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
// /api/assignacions
router.get('/centre/:idCentre', authMiddleware_1.authenticateToken, assignacioController.getAssignacionsByCentre);
router.get('/:idAssignacio/checklist', authMiddleware_1.authenticateToken, assignacioController.getChecklist);
router.patch('/checklist/:idItem', authMiddleware_1.authenticateToken, assignacioController.updateChecklistItem);
router.get('/incidencies/centre/:idCentre', authMiddleware_1.authenticateToken, assignacioController.getIncidenciesByCentre);
router.post('/incidencies', authMiddleware_1.authenticateToken, assignacioController.createIncidencia);
router.post('/', authMiddleware_1.authenticateToken, assignacioController.createAssignacioFromPeticio);
router.post('/:idAssignacio/inscripcions', authMiddleware_1.authenticateToken, assignacioController.createInscripcions);
router.post('/auto-generate', authMiddleware_1.authenticateToken, assignacioController.generateAutomaticAssignments);
// Phase 2 Specifics
router.post('/tetris', authMiddleware_1.authenticateToken, tetrisController.triggerTetris);
router.post('/:idAssignacio/enrollment/excel', authMiddleware_1.authenticateToken, upload.single('file'), enrollmentController.enrollStudentsViaExcel);
router.patch('/checklist/designate-profs/:idAssignacio', authMiddleware_1.authenticateToken, assignacioController.designateProfessors);
router.post('/upload/validate', authMiddleware_1.authenticateToken, upload.single('file'), assignacioController.validateDocumentUpload);
exports.default = router;
