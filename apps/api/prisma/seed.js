// apps/api/prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando Seed para PostgreSQL...');

  // 1. LIMPIEZA (Borrar datos antiguos para no duplicar)
  // El orden importa por las claves foráneas
  await prisma.assistencia.deleteMany();
  await prisma.inscripcio.deleteMany();
  await prisma.assignacio.deleteMany();
  await prisma.peticio.deleteMany();
  await prisma.taller.deleteMany();
  await prisma.alumne.deleteMany();
  await prisma.logAuditoria.deleteMany();
  await prisma.usuari.deleteMany();
  await prisma.centre.deleteMany();
  await prisma.sector.deleteMany();
  await prisma.rol.deleteMany();

  console.log('🧹 Base de datos limpiada.');

  // 2. CREAR ROLES (Tablas Maestras)
  console.log('👤 Creando Roles...');
  const rolAdmin = await prisma.rol.create({ data: { nom_rol: 'ADMIN' } });
  const rolCoord = await prisma.rol.create({ data: { nom_rol: 'COORDINADOR' } });
  const rolProfe = await prisma.rol.create({ data: { nom_rol: 'PROFESSOR' } });

  // 3. CREAR SECTORES
  console.log('🏭 Creando Sectores...');
  const sectorAgro = await prisma.sector.create({
    data: { nom: 'Agroalimentari i Manufacturer', descripcio: 'Sector primario y transformación' }
  });
  const sectorOci = await prisma.sector.create({
    data: { nom: 'Oci i Benestar', descripcio: 'Servicios personales' }
  });
  const sectorEnergia = await prisma.sector.create({
    data: { nom: 'Energia i Sostenibilitat', descripcio: 'Renovables y medio ambiente' }
  });

  // 4. CREAR CENTROS
  console.log('🏫 Creando Centros...');
  const centroBrossa = await prisma.centre.create({
    data: {
      nom: 'Institut Joan Brossa',
      codi_centre: '08012345',
      email_contacte: 'brossa@xtec.cat',
      telefon_contacte: '931112233',
      adreca: 'Carrer Brossa, 1'
    }
  });

  const centroMila = await prisma.centre.create({
    data: {
      nom: 'INS Milà i Fontanals',
      codi_centre: '08099999',
      email_contacte: 'mila@xtec.cat',
      telefon_contacte: '934445566',
      adreca: 'Carrer Milà, 2'
    }
  });

  // 5. CREAR USUARIOS (Profesores/Coordinadores)
  // 5. CREAR USUARIOS ESPECIFICOS (Requerimiento del Proyecto)
  console.log('users Creando Usuarios Específicos...');
  const salt = await bcrypt.genSalt(10);
  
  // Contraseñas generadas
  const passAdmin = await bcrypt.hash('Admin@1234', salt);
  const passCentro = await bcrypt.hash('Centro@1234', salt); // Coordinador
  const passProfe = await bcrypt.hash('Profe@1234', salt);

  // 1. ADMIN (Global) - admin@admin.com
  await prisma.usuari.create({
    data: {
      nom_complet: 'Administrador Global',
      email: 'admin@admin.com',
      password_hash: passAdmin,
      id_rol: rolAdmin.id
    }
  });

  // 2. CENTROS (Coordinador) - centros@centros.com
  // Asignamos al centro Brossa como ejemplo
  await prisma.usuari.create({
    data: {
      nom_complet: 'Coordinador General',
      email: 'centros@centros.com',
      password_hash: passCentro,
      id_rol: rolCoord.id,
      id_centre: centroBrossa.id
    }
  });

  // 3. PROFESOR (Mobile) - profe@profe.com
  // Asignamos al centro Milà como ejemplo
  await prisma.usuari.create({
    data: {
      nom_complet: 'Professor Ejemplo',
      email: 'profe@profe.com',
      password_hash: passProfe,
      id_rol: rolProfe.id,
      id_centre: centroMila.id
    }
  });

  // 6. CREAR TALLERES
  console.log('🛠️ Creando Talleres...');
  await prisma.taller.create({
    data: {
      titol: 'Fusta',
      descripcio_curta: "Exploració a través de la construcció d'un producte.",
      durada_h: 20,
      places_maximes: 16, // Parseado a Int
      modalitat: 'A',     // Enum
      id_sector: sectorAgro.id
    }
  });

  await prisma.taller.create({
    data: {
      titol: 'Imatge personal per a tothom',
      descripcio_curta: 'Formació específica sobre atenció al client.',
      durada_h: 20,
      places_maximes: 20,
      modalitat: 'B',
      id_sector: sectorOci.id
    }
  });

  await prisma.taller.create({
    data: {
      titol: 'Energies Renovables',
      descripcio_curta: 'Descoberta de perfils professionals sostenibles.',
      durada_h: 30,
      places_maximes: 15,
      modalitat: 'C',
      id_sector: sectorEnergia.id
    }
  });

  // 7. CREAR ALUMNOS
  // Nota: He inventado IDALUs porque son obligatorios y únicos
  console.log('🎓 Creando Alumnos...');
  await prisma.alumne.create({
    data: {
      nom: 'Ana',
      cognoms: 'García',
      idalu: '111111111', // Inventado
      curs: '3r ESO',
      id_centre_procedencia: centroBrossa.id
    }
  });

  await prisma.alumne.create({
    data: {
      nom: 'Carlos',
      cognoms: 'López',
      idalu: '222222222',
      curs: '4t ESO',
      id_centre_procedencia: centroMila.id
    }
  });

  console.log('✅ Seed completado con éxito.');
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });