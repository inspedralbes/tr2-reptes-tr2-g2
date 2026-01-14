const prisma = require('../lib/prisma');

// GET: Listar todos
exports.getCentres = async (req, res) => {
  try {
    const centres = await prisma.centre.findMany();
    res.json(centres);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener centros' });
  }
};

// GET: Uno por ID
exports.getCentreById = async (req, res) => {
  const { id } = req.params;
  try {
    const centre = await prisma.centre.findUnique({
      where: { id: parseInt(id) }
    });
    if (!centre) return res.status(404).json({ error: 'Centro no encontrado' });
    res.json(centre);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener centro' });
  }
};

// POST: Crear
exports.createCentre = async (req, res) => {
  try {
    const newCentre = await prisma.centre.create({
      data: req.body // Asegúrate de validar datos en producción
    });
    res.json(newCentre);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear centro' });
  }
};