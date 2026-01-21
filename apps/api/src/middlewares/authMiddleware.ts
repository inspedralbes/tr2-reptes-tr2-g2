import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secreto_super_seguro';


export interface AuthRequest extends Request {
  user?: {
    userId: number;
    role: string;
    centreId?: number;
  };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Token no proporcionado' });

  jwt.verify(token, JWT_SECRET, (err, user: any) => {
    if (err) {

      return res.status(401).json({ error: 'Token inválido o expirado' });
    }

    req.user = user;
    next();
  });
};

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'ADMIN') {

    return res.status(403).json({ error: 'Acceso denegado: Se requiere rol de Administrador' });
  }
  next();
};

export const isCoordinator = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'COORDINADOR') {
    return res.status(403).json({ error: 'Acceso denegado: Se requiere rol de Coordinador' });
  }
  next();
};
