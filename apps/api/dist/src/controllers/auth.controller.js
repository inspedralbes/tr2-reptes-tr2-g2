"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = exports.login = void 0;
// apps/api/src/controllers/auth.controller.ts
const prisma_1 = __importDefault(require("../lib/prisma"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        // 1. Buscar usuario por email (findUnique es optimizado para campos @unique)
        const usuari = await prisma_1.default.usuari.findUnique({
            where: { email },
            include: {
                rol: true, // Traemos el nombre del rol
                centre: true // Traemos datos del centro si los tiene
            }
        });
        if (!usuari) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        // 2. Comparar contraseña (suponiendo que las guardas hasheadas)
        const validPassword = await bcrypt_1.default.compare(password, usuari.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        // 3. Generar JWT
        const token = jsonwebtoken_1.default.sign({
            userId: usuari.id_usuari,
            role: usuari.rol.nom_rol,
            centreId: usuari.id_centre
        }, process.env.JWT_SECRET || 'secreto_super_seguro', { expiresIn: '8h' });
        // 4. Responder (Sin enviar el password_hash de vuelta)
        const { password_hash, ...userWithoutPass } = usuari;
        res.json({
            token,
            user: userWithoutPass
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};
exports.login = login;
const register = async (req, res) => {
    // Lógica de registro para Admins o script inicial
    // ... similar al createTaller pero con bcrypt.hash(password, 10)
    res.status(501).json({ error: 'Not implemented' });
};
exports.register = register;
