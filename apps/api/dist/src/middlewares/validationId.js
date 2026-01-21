"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Este middleware corta la petición si el ID está mal, protegiendo al controlador
const validateId = (req, res, next) => {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
        return res.status(400).json({ error: "El ID debe ser numérico" });
    }
    // Si todo está bien, pasa al siguiente paso (el controlador)
    next();
};
exports.default = validateId;
