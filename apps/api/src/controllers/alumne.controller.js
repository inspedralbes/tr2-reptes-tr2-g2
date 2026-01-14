const Alumne = require('../models/alumne.model');

const alumneController = {
  getAllAlumnes: async (req, res) => {
    try {
      const alumnes = await Alumne.findAll();
      res.status(200).json({ alumnes });
    } catch (error) {
      res.status(500).json({ error: "Error al buscar alumnes" });
    }
  },
};

module.exports = alumneController;