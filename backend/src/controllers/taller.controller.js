const Taller = require('../models/taller.model');

const tallerController = {
  getAllTalleres: async (req, res) => {
    try {
      const talleres = await Taller.findAll();
      res.status(200).json(talleres);
    } catch (error) {
      res.status(500).json({ error: "Error al buscar talleres" });
    }
  }
};

module.exports = tallerController;
