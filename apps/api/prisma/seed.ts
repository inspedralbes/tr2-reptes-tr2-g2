import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const PHASES = {
  SOLICITUD: 'Solicitud e Inscripción',
  PLANIFICACION: 'Planificación y Asignación',
  EJECUCION: 'Ejecución y Seguimiento',
  CIERRE: 'Cierre y Evaluación'
} as const;

async function main() {
  console.log('🌱 Iniciando Seed para el programa Iter...');

  // 1. LIMPIEZA TOTAL
  console.log('🧹 Limpiando base de datos...');
  const tables = [
    'respostes_questionari', 'enviaments_questionaris', 'preguntes', 'model_questionaris',
    'autoconsultes_alumnes', 'avaluacio_competencial', 'avaluacions_docents',
    'assistencia', 'inscripcions', 'checklist_assignacio', 'assignacio_professors',
    'assignacions', 'peticions', 'tallers', 'alumnes', 'professors', 'incidencies',
    'notificacions', 'logs_auditoria', 'calendari_events', 'fases', 'enquestes',
    'certificats', 'usuaris', 'centres', 'sectors', 'rols', 'competencies'
  ];

  for (const table of tables) {
    try {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE`);
    } catch (e) {
      console.log(`⚠️  No se pudo truncar la tabla ${table} (posiblemente no existe aún).`);
    }
  }

  // 2. ROLES BÁSICOS
  const rolAdmin = await prisma.rol.create({ data: { nom_rol: 'ADMIN' } });
  const rolCoord = await prisma.rol.create({ data: { nom_rol: 'COORDINADOR' } });
  const rolProfe = await prisma.rol.create({ data: { nom_rol: 'PROFESSOR' } });

  // 3. SECTORES
  const sectorTecno = await prisma.sector.create({ data: { nom: 'Transformació Digital' } });
  const sectorCreacio = await prisma.sector.create({ data: { nom: 'Creació Artística' } });
  const sectorManufacturer = await prisma.sector.create({ data: { nom: 'Manufacturer' } });

  // 4. CENTROS Y COORDINADORES (Aislamiento de datos)
  const salt = await bcrypt.genSalt(10);
  const passDefault = await bcrypt.hash('Centro@1234', salt);

  // CENTRO A: Institut Joan Brossa
  const centroBrossa = await prisma.centre.create({
    data: { codi_centre: '08014231', nom: 'Institut Joan Brossa', email_contacte: 'a8014231@xtec.cat' }
  });
  await prisma.usuari.create({
    data: {
      nom_complet: 'Coord. Joan Brossa',
      email: 'centros@centros.com',
      password_hash: passDefault,
      id_rol: rolCoord.id_rol,
      id_centre: centroBrossa.id_centre
    }
  });

  // CENTRO B: Institut Pau Claris
  const centroPauClaris = await prisma.centre.create({
    data: { codi_centre: '08013147', nom: 'Institut Pau Claris', email_contacte: 'a8013147@xtec.cat' }
  });
  await prisma.usuari.create({
    data: {
      nom_complet: 'Coord. Pau Claris',
      email: 'coordinacion@instituto.com',
      password_hash: passDefault,
      id_rol: rolCoord.id_rol,
      id_centre: centroPauClaris.id_centre
    }
  });

  // 5. PROFESORES ESPECIALIZADOS
  const profBrossa = await prisma.professor.create({
    data: { nom: 'Marc Serra (Brossa)', contacte: 'mserra@brossa.cat', id_centre: centroBrossa.id_centre }
  });
  const profPauClaris = await prisma.professor.create({
    data: { nom: 'Elena Ruiz (Pau Claris)', contacte: 'eruiz@pauclaris.cat', id_centre: centroPauClaris.id_centre }
  });

  // 6. ALUMNOS POR CENTRO
  await prisma.alumne.create({
    data: { nom: 'Oriol', cognoms: 'Vidal', idalu: 'B001', curs: '4t ESO', id_centre_procedencia: centroBrossa.id_centre }
  });
  await prisma.alumne.create({
    data: { nom: 'Laia', cognoms: 'Soler', idalu: 'P001', curs: '3r ESO', id_centre_procedencia: centroPauClaris.id_centre }
  });

  // 7. CATÁLOGO DE TALLERES
  const tallerRobotica = await prisma.taller.create({
    data: { titol: 'Robòtica i IoT', modalitat: 'A', id_sector: sectorTecno.id_sector, durada_h: 3, descripcio_curta: 'Taller de robótica avanzada' }
  });
  const tallerCinema = await prisma.taller.create({
    data: { titol: 'Cinema i Edició', modalitat: 'B', id_sector: sectorCreacio.id_sector, durada_h: 2, descripcio_curta: 'Creación cinematográfica' }
  });

  // 8. PETICIONES (Una por cada centro para verificar visibilidad)
  await prisma.peticio.create({
    data: {
      id_centre: centroBrossa.id_centre,
      id_taller: tallerRobotica.id_taller,
      alumnes_aprox: 15,
      estat: 'Aprovada',
      modalitat: 'A',
      prof1_id: profBrossa.id_professor
    }
  });

  await prisma.peticio.create({
    data: {
      id_centre: centroPauClaris.id_centre,
      id_taller: tallerCinema.id_taller,
      alumnes_aprox: 20,
      estat: 'Pendent',
      modalitat: 'B',
      prof1_id: profPauClaris.id_professor
    }
  });

  // 9. CONFIGURACIÓN DE FASES
  const now = new Date();
  await prisma.fase.create({
    data: {
      nom: PHASES.SOLICITUD,
      descripcio: 'Període de sol·licitud',
      data_inici: new Date(now.getFullYear(), 0, 1),
      data_fi: new Date(now.getFullYear(), 1, 15),
      activa: true,
      ordre: 1
    }
  });

  // 10. ADMIN GLOBAL
  await prisma.usuari.create({
    data: {
      nom_complet: 'Admin Iter',
      email: 'admin@admin.com',
      password_hash: await bcrypt.hash('Admin@1234', salt),
      id_rol: rolAdmin.id_rol
    }
  });

  console.log('✅ Seed finalizado con éxito.');
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });