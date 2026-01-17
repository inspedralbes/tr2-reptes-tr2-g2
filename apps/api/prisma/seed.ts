import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando Seed para PostgreSQL...');

  // 1. LIMPIEZA
  await prisma.assistencia.deleteMany();
  await prisma.inscripcio.deleteMany();
  await prisma.assignacio.deleteMany();
  await prisma.peticio.deleteMany();
  await prisma.taller.deleteMany();
  await prisma.alumne.deleteMany();
  await prisma.professor.deleteMany();
  await prisma.logAuditoria.deleteMany();
  await prisma.calendariEvent.deleteMany();
  await prisma.fase.deleteMany();
  await prisma.usuari.deleteMany();
  await prisma.centre.deleteMany();
  await prisma.sector.deleteMany();
  await prisma.rol.deleteMany();

  console.log('🧹 Base de datos limpiada.');

  // 2. CREAR ROLES
  const rolAdmin = await prisma.rol.create({ data: { nom_rol: 'ADMIN' } });
  const rolCoord = await prisma.rol.create({ data: { nom_rol: 'COORDINADOR' } });
  const rolProfe = await prisma.rol.create({ data: { nom_rol: 'PROFESSOR' } });

  // 3. CREAR SECTORES
  const sectorAgro = await prisma.sector.create({ data: { nom: 'Agroalimentari i Manufacturer' } });
  const sectorOci = await prisma.sector.create({ data: { nom: 'Oci i Benestar' } });
  const sectorEnergia = await prisma.sector.create({ data: { nom: 'Energia i Sostenibilitat' } });

  // 4. CREAR CENTROS
  const centroBrossa = await prisma.centre.create({
    data: { nom: 'Institut Joan Brossa', codi_centre: '08012345' }
  });
  const centroMila = await prisma.centre.create({
    data: { nom: 'INS Milà i Fontanals', codi_centre: '08099999' }
  });

  // 5. CREAR PROFESORES (PARA EL DESPLEGABLE)
  console.log('👨‍🏫 Creando Profesores...');
  const prof1 = await prisma.professor.create({
    data: { nom: 'Joan Martí', contacte: 'joan.marti@xtec.cat', id_centre: centroBrossa.id_centre }
  });
  const prof2 = await prisma.professor.create({
    data: { nom: 'Maria Soler', contacte: '934445566', id_centre: centroBrossa.id_centre }
  });
  await prisma.professor.create({
    data: { nom: 'Pere Pons', contacte: 'pere.pons@xtec.cat', id_centre: centroMila.id_centre }
  });

  // 6. CREAR USUARIOS
  const salt = await bcrypt.genSalt(10);
  const passAdmin = await bcrypt.hash('Admin@1234', salt);
  const passCentro = await bcrypt.hash('Centro@1234', salt);
  const passProfe = await bcrypt.hash('Profe@1234', salt);

  // 1. ADMIN (Global)
  await prisma.usuari.create({
    data: {
      nom_complet: 'Administrador Global',
      email: 'admin@admin.com',
      password_hash: passAdmin,
      id_rol: rolAdmin.id_rol
    }
  });

  // 2. COORDINADOR (Centro Brossa)
  await prisma.usuari.create({
    data: {
      nom_complet: 'Coordinador General',
      email: 'centros@centros.com',
      password_hash: passCentro,
      id_rol: rolCoord.id_rol,
      id_centre: centroBrossa.id_centre
    }
  });

  // 3. PROFESOR (Centro Milà)
  await prisma.usuari.create({
    data: {
      nom_complet: 'Professor Ejemplo',
      email: 'profe@profe.com',
      password_hash: passProfe,
      id_rol: rolProfe.id_rol,
      id_centre: centroMila.id_centre
    }
  });

  // 7. CREAR TALLERES
  const tallerFusta = await prisma.taller.create({
    data: { titol: 'Fusta', durada_h: 20, places_maximes: 16, modalitat: 'A', id_sector: sectorAgro.id_sector, descripcio_curta: 'Construcció en fusta' }
  });

  // 8. CREAR ALUMNOS
  console.log('🎓 Creando Alumnos...');
  const alumnosData = [
    { nom: 'Ana', cognoms: 'García', idalu: '111', curs: '3r ESO', id_centre_procedencia: centroBrossa.id_centre },
    { nom: 'Carlos', cognoms: 'López', idalu: '222', curs: '4t ESO', id_centre_procedencia: centroBrossa.id_centre },
    { nom: 'Marta', cognoms: 'Sánchez', idalu: '333', curs: '3r ESO', id_centre_procedencia: centroBrossa.id_centre },
    { nom: 'Pol', cognoms: 'Riba', idalu: '444', curs: '4t ESO', id_centre_procedencia: centroBrossa.id_centre },
    { nom: 'Laia', cognoms: 'Vila', idalu: '555', curs: '1r BAT', id_centre_procedencia: centroBrossa.id_centre }
  ];
  const creados = [];
  for (const a of alumnosData) {
    const created = await prisma.alumne.create({ data: a });
    creados.push(created);
  }

  // 9. FASES
  const fase1 = await prisma.fase.create({
    data: { nom: 'Solicitud e Inscripción', data_inici: new Date('2025-09-01'), data_fi: new Date('2025-12-31'), activa: true }
  });

  // 10. PETICIÓN DE EJEMPLO
  console.log('📝 Creando Petición de ejemplo...');
  await prisma.peticio.create({
    data: {
      id_centre: centroBrossa.id_centre,
      id_taller: tallerFusta.id_taller,
      estat: 'Pendent',
      modalitat: 'A',
      prof1_id: prof1.id_professor,
      prof2_id: prof2.id_professor,
      ids_alumnes: [creados[0].id_alumne, creados[1].id_alumne],
      alumnes: {
        connect: [{ id_alumne: creados[0].id_alumne }, { id_alumne: creados[1].id_alumne }]
      }
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