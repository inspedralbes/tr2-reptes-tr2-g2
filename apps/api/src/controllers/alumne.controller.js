const prisma = require('../lib/prisma');

exports.getAlumnes = async (req, res) => {
  try {
    const alumnes = await prisma.alumne.findMany({
      include: { centre_procedencia: true } // Trae el nombre del centro
    });
    res.json(alumnes);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener alumnos' });
  }
};

exports.createAlumne = async (req, res) => {
  try {
    const alumne = await prisma.alumne.create({
      data: req.body
    });
    res.json(alumne);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear alumno' });
  }
};