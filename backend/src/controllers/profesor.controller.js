const Profesor = require('../models/profesor.model');
const bcrypt = require('bcryptjs');

const profesorController = {
  getAllProfesores: async (req, res) => {
    try {
      const profesores = await Profesor.findAll();
      res.status(200).json({ profesores });
    } catch (error) {
      res.status(500).json({ error: "Error al buscar profesores" });
    }
  },

  createProfesor: async (req, res) => {
    try {
      const { nombre, email, password, centro_id } = req.body;

      // Validaciones básicas similares a auth.controller
      if (!nombre || !email || !password) {
        return res.status(400).json({ error: 'Por favor, complete todos los campos obligatorios' });
      }

      // Verificar si el usuario ya existe
      let existingProfesor = await Profesor.findByEmail(email);
      if (existingProfesor) {
        return res.status(400).json({ error: 'El usuario ya existe' });
      }

      // Encriptar contraseña
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newProfesorData = {
        nombre,
        email,
        password: hashedPassword,
        centro_id: centro_id || null,
        createdAt: new Date()
      };

      const result = await Profesor.create(newProfesorData);
      // Construir el objeto a devolver (similar a lo que haría Mongo si devolviera el documento)
      const newProfesor = { ...newProfesorData, _id: result.insertedId };
      
      res.status(201).json(newProfesor);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error al crear profesor" });
    }
  },

  getProfesorById: async (req, res) => {
    try {
      const { id } = req.params;
      const profesor = await Profesor.findById(id);
      if (profesor) {
        res.status(200).json(profesor);
      } else {
        res.status(404).json({ error: "Profesor no encontrado" });
      }
    } catch (error) {
      res.status(500).json({ error: "Error al buscar profesor" });
    }
  },

  updateProfesor: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };

      // Si se actualiza la contraseña, hay que hashearla
      if (updateData.password) {
          const salt = await bcrypt.genSalt(10);
          updateData.password = await bcrypt.hash(updateData.password, salt);
      }

      const result = await Profesor.updateById(id, updateData);
      if (result.matchedCount === 0) {
        return res.status(404).json({ error: "Profesor no encontrado" });
      }
      // Devolver el objeto actualizado o mensaje de éxito
      // Taller controller devuelve updatedTaller (result de updateOne)
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: "Error al actualizar profesor" });
    }
  },

  deleteProfesor: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await Profesor.deleteById(id);
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: "Profesor no encontrado" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Error al eliminar profesor" });
    }
  }
};

module.exports = profesorController;