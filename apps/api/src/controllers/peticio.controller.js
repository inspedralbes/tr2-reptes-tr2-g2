const prisma = require('../lib/prisma');

// GET: Ver peticiones (Idealmente filtrar por rol aquí)
exports.getPeticions = async (req, res) => {
  try {
    const peticions = await prisma.peticio.findMany({
      include: {
        centre: true,
        taller: true
      }
    });
    res.json(peticions);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener peticiones' });
  }
};

// POST: Crear solicitud
exports.createPeticio = async (req, res) => {
  const { id_centre, id_taller, alumnes_aprox, comentaris } = req.body;
  try {
    const nuevaPeticio = await prisma.peticio.create({
      data: {
        centre: { connect: { id: parseInt(id_centre) } },
        taller: { connect: { id: parseInt(id_taller) } },
        alumnes_aprox: parseInt(alumnes_aprox),
        comentaris,
        estat: 'PENDENT'
      }
    });
    res.json(nuevaPeticio);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear petición' });
  }
};

// PATCH: Cambiar estado (Aprobar/Rechazar)
exports.updatePeticioStatus = async (req, res) => {
  const { id } = req.params;
  const { estat } = req.body; // 'ACCEPTADA', 'REBUTJADA'
  
  try {
    const updated = await prisma.peticio.update({
      where: { id: parseInt(id) },
      data: { estat }
    });
    
    // AQUÍ IRÍA LA LÓGICA DE CREAR LA ASIGNACIÓN AUTOMÁTICA SI SE ACEPTA
    // Lo haremos más adelante para no complicar ahora.
    
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar estado' });
  }
};