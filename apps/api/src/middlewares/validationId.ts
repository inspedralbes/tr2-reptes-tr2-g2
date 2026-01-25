import { Request, Response, NextFunction } from 'express';

// Este middleware corta la petición si el ID está mal, protegiendo al controlador
const validateId = (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  
  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ error: "El ID debe ser numérico" });
  }
  
  // Si todo está bien, pasa al siguiente paso (el controlador)
  next();
};

export default validateId;