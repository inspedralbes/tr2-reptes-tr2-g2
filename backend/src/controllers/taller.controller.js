const Taller = require('../models/taller.model');

const tallerController = {
  getAllTalleres: async (req, res) => {
    try {
      const talleres = await Taller.findAll();
      res.status(200).json({ talleres });
    } catch (error) {
      res.status(500).json({ error: "Error al buscar talleres" });
    }
  },

  createTaller: async (req, res) => {
    try {
      const newTaller = await Taller.create(req.body);
      res.status(201).json(newTaller);
    } catch (error) {
      res.status(500).json({ error: "Error al crear taller" });
    }
  },

  getTallerById: async (req, res) => {
    try {
      const { id } = req.params;
      const taller = await Taller.findById(id);
      if (taller) {
        res.status(200).json(taller);
      } else {
        res.status(404).json({ error: "Taller no encontrado" });
      }
    } catch (error) {
      res.status(500).json({ error: "Error al buscar taller" });
    }
  },

  updateTaller: async (req, res) => {
    try {
      const { id } = req.params;
      const updatedTaller = await Taller.updateById(id, req.body);
      res.status(200).json(updatedTaller);
    } catch (error) {
      res.status(500).json({ error: "Error al actualizar taller" });
    }
  },

  deleteTaller: async (req, res) => {
    try {
      const { id } = req.params;
      await Taller.deleteById(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Error al eliminar taller" });
    }
  }
};

module.exports = tallerController;
