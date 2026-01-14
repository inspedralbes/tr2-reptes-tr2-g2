// apps/api/src/controllers/auth.controller.js
const prisma = require('../lib/prisma');
const bcrypt = require('bcrypt'); // Asegúrate de tener: npm install bcrypt jsonwebtoken
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Buscar usuario por email (findUnique es optimizado para campos @unique)
    const usuari = await prisma.usuari.findUnique({
      where: { email },
      include: {
        rol: true,   // Traemos el nombre del rol
        centre: true // Traemos datos del centro si los tiene
      }
    });

    if (!usuari) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // 2. Comparar contraseña (suponiendo que las guardas hasheadas)
    const validPassword = await bcrypt.compare(password, usuari.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // 3. Generar JWT
    const token = jwt.sign(
      { 
        userId: usuari.id, 
        role: usuari.rol.nom_rol, 
        centreId: usuari.id_centre 
      },
      process.env.JWT_SECRET || 'secreto_super_seguro',
      { expiresIn: '8h' }
    );

    // 4. Responder (Sin enviar el password_hash de vuelta)
    const { password_hash, ...userWithoutPass } = usuari;

    res.json({
      token,
      user: userWithoutPass
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

exports.register = async (req, res) => {
  // Lógica de registro para Admins o script inicial
  // ... similar al createTaller pero con bcrypt.hash(password, 10)
};