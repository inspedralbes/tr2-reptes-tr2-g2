const Profesor = require('../models/profesor.model');
const Centro = require('../models/centro.model');
const bcrypt = require('bcryptjs');
const jwt =require('jsonwebtoken');

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

  register: async (req, res) => {
    try {
      const { nombre, email, password } = req.body;

      // 1. Validaciones básicas
      if (!nombre || !email || !password) {
        return res.status(400).json({ error: 'Por favor, complete todos los campos' });
      }

      
      // 2. Validación de contraseña
      const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9].*[0-9]|.*[a-z].*[a-z]).{8,}$/;
      // Simple check: 8 chars, 1 uppercase, 1 special char.
      // Modified regex to be strictly: 8 chars, 1 uppercase, 1 special char (anywhere).
      const hasUpperCase = /[A-Z]/.test(password);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
      const isLongEnough = password.length >= 8;

      if (!hasUpperCase || !hasSpecialChar || !isLongEnough) {
        return res.status(400).json({ 
          error: 'La contraseña debe tener al menos 8 caracteres, una mayúscula y un carácter especial.' 
        });
      }
      

      // 3. Verificar si el usuario ya existe
      let profesor = await Profesor.findByEmail(email);
      if (profesor) {
        return res.status(400).json({ error: 'El usuario ya existe' });
      }

      // 4. Encriptar contraseña
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

       // 5. Buscar o crear el centro por defecto
       let centro = await Centro.findByName('CentroDefault');
       if (!centro) {
         const newCentro = {
           nom: 'CentroDefault',
           localitat: 'LocalitatDefault',
           actiu: true,
           data_creacio: new Date()
         };
         const createdCentro = await Centro.create(newCentro);
         // `create` devuelve un objecto con `insertedId`
         centro = { _id: createdCentro.insertedId, ...newCentro };
       }
 
       // 6. Crear el objeto profesor
      profesor = {
        nombre,
        email,
        password: hashedPassword,
        centro_id: centro._id, // O lo que corresponda por defecto
        createdAt: new Date()
      };

      const result = await Profesor.create(profesor);
      
      // 7. Generar JWT
      const payload = {
        profesor: {
          id: result.insertedId,
          email: profesor.email,
          nombre: profesor.nombre,
          centro_id: profesor.centro_id
        },
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '1h' },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );

    } catch (error) {
      console.error(error.message);
      res.status(500).send('Error en el servidor');
    }
  }
};

module.exports = authController;
