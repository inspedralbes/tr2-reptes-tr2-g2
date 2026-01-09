const Profesor = require('../models/profesor.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authController = {
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // 1. Verificar si el profesor existe
      const profesor = await Profesor.findByEmail(email);
      if (!profesor) {
        return res.status(404).json({ error: 'Profesor no encontrado' });
      }

      // 2. Comparar la contraseña
      const isMatch = await bcrypt.compare(password, profesor.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      // 3. Generar JWT
      const payload = {
        profesor: {
          id: profesor._id,
          email: profesor.email,
          nombre: profesor.nombre,
          centro_id: profesor.centro_id
        },
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '1h' }, // Token expira en 1 hora
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Error en el servidor');
    }
  },
};

module.exports = authController;
