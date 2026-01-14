const { ObjectId } = require('mongodb');

// Este middleware corta la petición si el ID está mal, protegiendo al controlador
const validateId = (req, res, next) => {
  const { id } = req.params;
  
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: "El formato del ID no es válido" });
  }
  
  // Si todo está bien, pasa al siguiente paso (el controlador)
  next();
};

module.exports = validateId;