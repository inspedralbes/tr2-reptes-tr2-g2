import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

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
  await prisma.calendariEvent.deleteMany();
  await prisma.fase.deleteMany();
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
      id_rol: rolAdmin.id_rol
    }
  });

  // 2. CENTROS (Coordinador) - centros@centros.com
  // Asignamos al centro Brossa como ejemplo
  await prisma.usuari.create({
    data: {
      nom_complet: 'Coordinador General',
      email: 'centros@centros.com',
      password_hash: passCentro,
      id_rol: rolCoord.id_rol,
      id_centre: centroBrossa.id_centre
    }
  });

  // 3. PROFESOR (Mobile) - profe@profe.com
  // Asignamos al centro Milà como ejemplo
  await prisma.usuari.create({
    data: {
      nom_complet: 'Professor Ejemplo',
      email: 'profe@profe.com',
      password_hash: passProfe,
      id_rol: rolProfe.id_rol,
      id_centre: centroMila.id_centre
    }
  });

  // 6. CREAR TALLERES
  console.log('🛠️ Creando Talleres...');
  const tallerFusta = await prisma.taller.create({
    data: {
      titol: 'Fusta',
      descripcio_curta: "Exploració a través de la construcció d'un producte.",
      durada_h: 20,
      places_maximes: 16, // Parseado a Int
      modalitat: 'A',     // Enum
      id_sector: sectorAgro.id_sector
    }
  });

  const tallerImatge = await prisma.taller.create({
    data: {
      titol: 'Imatge personal per a tothom',
      descripcio_curta: 'Formació específica sobre atenció al client.',
      durada_h: 20,
      places_maximes: 20,
      modalitat: 'B',
      id_sector: sectorOci.id_sector
    }
  });

  const tallerEnergia = await prisma.taller.create({
    data: {
      titol: 'Energies Renovables',
      descripcio_curta: 'Descoberta de perfils professionals sostenibles.',
      durada_h: 30,
      places_maximes: 15,
      modalitat: 'C',
      id_sector: sectorEnergia.id_sector
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
      id_centre_procedencia: centroBrossa.id_centre
    }
  });

  await prisma.alumne.create({
    data: {
      nom: 'Carlos',
      cognoms: 'López',
      idalu: '222222222',
      curs: '4t ESO',
      id_centre_procedencia: centroMila.id_centre
    }
  });

  // 8. CREAR FASES DEL PROGRAMA (Dinámicas)
  console.log('🗓️ Creando Fases del Programa...');
  const fase1 = await prisma.fase.create({
    data: {
      nom: 'Solicitud e Inscripción',
      descripcio: 'Fase inicial donde los centros solicitan talleres y registran alumnos.',
      data_inici: new Date('2025-09-01'),
      data_fi: new Date('2025-10-15'),
      activa: true
    }
  });

  const fase2 = await prisma.fase.create({
    data: {
      nom: 'Planificación y Asignación',
      descripcio: 'Los administradores validan peticiones y asignan talleres a profesores.',
      data_inici: new Date('2025-10-16'),
      data_fi: new Date('2025-11-15'),
      activa: false
    }
  });

  const fase3 = await prisma.fase.create({
    data: {
      nom: 'Ejecución y Seguimiento',
      descripcio: 'Realización de sesiones de talleres y control de asistencia.',
      data_inici: new Date('2025-11-16'),
      data_fi: new Date('2026-05-30'),
      activa: false
    }
  });

  const fase4 = await prisma.fase.create({
    data: {
      nom: 'Cierre y Evaluación',
      descripcio: 'Finalización de talleres y recogida de encuestas de satisfacción.',
      data_inici: new Date('2026-06-01'),
      data_fi: new Date('2026-07-15'),
      activa: false
    }
  });

  // 9. CREAR HITOS GLOBALES (Enlazados a fases)
  console.log('🚩 Creando Hitos Globales...');
  await prisma.calendariEvent.create({
    data: {
      id_fase: fase1.id_fase,
      titol: 'Reunión de Presentación',
      descripcio: 'Reunión inicial para todos los coordinadores de centros.',
      data: new Date('2025-09-30'),
      tipus: 'milestone'
    }
  });

  await prisma.calendariEvent.create({
    data: {
      id_fase: fase1.id_fase,
      titol: 'Límite de Demanda',
      descripcio: 'Último día para enviar solicitudes de talleres.',
      data: new Date('2025-10-10'),
      tipus: 'deadline'
    }
  });

  await prisma.calendariEvent.create({
    data: {
      id_fase: fase2.id_fase,
      titol: 'Publicación de Asignaciones',
      descripcio: 'Se publican las listas definitivas de talleres asignados.',
      data: new Date('2025-10-25'),
      tipus: 'milestone'
    }
  });
  // 10. CREAR PETICIONES Y ASIGNACIONES DE PRUEBA
  console.log('📝 Creando Peticiones y Asignaciones de prueba...');
  
  // Una petición pendiente del centro Milà
  await prisma.peticio.create({
    data: {
      id_centre: centroMila.id_centre,
      id_taller: tallerFusta.id_taller,
      estat: 'Pendent',
      data_peticio: new Date('2025-10-05')
    }
  });

  // Una asignación confirmada para el centro Brossa
  await prisma.assignacio.create({
    data: {
      id_centre: centroBrossa.id_centre,
      id_taller: tallerImatge.id_taller,
      data_inici: new Date('2025-10-20T10:00:00'),
      data_fi: new Date('2025-10-20T12:00:00')
    }
  });

  // Otra asignación para noviembre
  await prisma.assignacio.create({
    data: {
      id_centre: centroBrossa.id_centre,
      id_taller: tallerEnergia.id_taller,
      data_inici: new Date('2025-11-05T09:00:00'),
      data_fi: new Date('2025-11-05T14:00:00')
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