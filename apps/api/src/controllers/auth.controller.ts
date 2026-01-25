// apps/api/src/controllers/auth.controller.ts
import prisma from '../lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import logger from '../lib/logger';

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // 1. Buscar usuario por email (findUnique es optimizado para campos @unique)
    const usuari = await prisma.usuari.findUnique({
      where: { email },
      include: {
        rol: true,   // Traemos el nombre del rol
        centre: true // Traemos datos del centro si los tiene
      }
    });

    if (!usuari) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // 2. Comparar contraseña (suponiendo que las guardas hasheadas)
    const validPassword = await bcrypt.compare(password, usuari.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const secret = process.env.JWT_SECRET;
    
    if (!secret) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('JWT_SECRET no està configurada en producció.');
      }
      logger.warn('⚠️ JWT_SECRET no configurada. Usando fallback inseguro para desarrollo.');
    }

    const token = jwt.sign(
      {
        userId: usuari.id_usuari,
        role: usuari.rol.nom_rol,
        centreId: usuari.id_centre
      },
      secret || 'secreto_super_seguro_dev',
      { expiresIn: '8h' }
    );

    // 4. Responder (Sin enviar el password_hash de vuelta)
    const { password_hash, ...userWithoutPass } = usuari;

    res.json({
      token,
      user: userWithoutPass
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

export const register = async (req: Request, res: Response) => {
  // Lógica de registro para Admins o script inicial
  // ... similar al createTaller pero con bcrypt.hash(password, 10)
  res.status(501).json({ error: 'Not implemented' });
};