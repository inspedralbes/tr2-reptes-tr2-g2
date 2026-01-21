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
  console.log('🌱 Iniciando Seed final para el programa Iter...');

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
      // Ignorar
    }
  }

  // 2. ROLES E INFRAESTRUCTURA
  const rolAdmin = await prisma.rol.create({ data: { nom_rol: 'ADMIN' } });
  const rolCoord = await prisma.rol.create({ data: { nom_rol: 'COORDINADOR' } });
  const rolProfe = await prisma.rol.create({ data: { nom_rol: 'PROFESSOR' } });

  const sectorTecno = await prisma.sector.create({ data: { nom: 'Transformació Digital' } });
  const sectorCreacio = await prisma.sector.create({ data: { nom: 'Creació Artística' } });
  const sectorIndus = await prisma.sector.create({ data: { nom: 'Industrial i Logística' } });

  const salt = await bcrypt.genSalt(10);
  const passDefault = await bcrypt.hash('Iter@1234', salt);

  // 3. ADMIN GLOBAL
  await prisma.usuari.create({
    data: {
      nom_complet: 'Administrador Global',
      email: 'admin@admin.com',
      password_hash: passDefault,
      id_rol: rolAdmin.id_rol
    }
  });

  // 4. CENTROS Y COORDINADORES
  const centroBrossa = await prisma.centre.create({
    data: { codi_centre: '08014231', nom: 'Institut Joan Brossa', email_contacte: 'a8014231@xtec.cat' }
  });
  await prisma.usuari.create({
    data: {
      nom_complet: 'Coord. Joan Brossa',
      email: 'coordinacion@brossa.cat',
      password_hash: passDefault,
      id_rol: rolCoord.id_rol,
      id_centre: centroBrossa.id_centre
    }
  });

  const centroPauClaris = await prisma.centre.create({
    data: { codi_centre: '08013147', nom: 'Institut Pau Claris', email_contacte: 'a8013147@xtec.cat' }
  });
  await prisma.usuari.create({
    data: {
      nom_complet: 'Coord. Pau Claris',
      email: 'coordinacion@pauclaris.cat',
      password_hash: passDefault,
      id_rol: rolCoord.id_rol,
      id_centre: centroPauClaris.id_centre
    }
  });

  // 5. PROFESORES Y ALUMNOS (Base para asignaciones futuras)
  const profesBrossa = [];
  const profesClaris = [];

  for (let i = 1; i <= 4; i++) {
    const pb = await prisma.professor.create({
      data: { nom: `Professor Brossa ${i}`, contacte: `prof.b${i}@brossa.cat`, id_centre: centroBrossa.id_centre }
    });
    profesBrossa.push(pb);
    const pc = await prisma.professor.create({
      data: { nom: `Professor Claris ${i}`, contacte: `prof.p${i}@pauclaris.cat`, id_centre: centroPauClaris.id_centre }
    });
    profesClaris.push(pc);
  }

  for (let i = 1; i <= 10; i++) {
    await prisma.alumne.create({
      data: { nom: `Alumne Brossa ${i}`, cognoms: 'Simulació', idalu: `B${100+i}`, curs: '4t ESO', id_centre_procedencia: centroBrossa.id_centre }
    });
    await prisma.alumne.create({
      data: { nom: `Alumne Claris ${i}`, cognoms: 'Simulació', idalu: `P${100+i}`, curs: '3r ESO', id_centre_procedencia: centroPauClaris.id_centre }
    });
  }

  // 6. CATÁLOGO EXTENDIDO DE TALLERES
  const tallers = [
    { titol: 'Robòtica i IoT', sector: sectorTecno.id_sector, modalitat: 'A', cap: 10, icona: 'ROBOT' },
    { titol: 'Cinema Digital', sector: sectorCreacio.id_sector, modalitat: 'B', cap: 8, icona: 'FILM' },
    { titol: 'Impressió 3D', sector: sectorIndus.id_sector, modalitat: 'A', cap: 7, icona: 'TOOLS' },
    { titol: 'Desenvolupament Web', sector: sectorTecno.id_sector, modalitat: 'C', cap: 6, icona: 'CODE' },
    { titol: 'Disseny Gràfic', sector: sectorCreacio.id_sector, modalitat: 'B', cap: 4, icona: 'PAINT' },
    { titol: 'Realitat Virtual', sector: sectorTecno.id_sector, modalitat: 'A', cap: 8, icona: 'GEAR' }, // Use GEAR as placeholder for VR
    { titol: 'Energies Renovables', sector: sectorIndus.id_sector, modalitat: 'B', cap: 10, icona: 'LEAF' }
  ];

  const creadosTallers = [];
  for (const t of tallers) {
    const nuevo = await prisma.taller.create({
      data: {
        titol: t.titol,
        modalitat: t.modalitat as any,
        id_sector: t.sector,
        durada_h: 3,
        places_maximes: (t as any).cap,
        icona: (t as any).icona,
        descripcio_curta: `Exploració pràctica de ${t.titol}.`
      }
    });
    creadosTallers.push(nuevo);
  }

  // 7. MULTITUD DE PETICIONES (Sin asignaciones)
  console.log('📝 Generando múltiples peticiones...');
  
  // Peticiones para Joan Brossa
  for (let i = 0; i < 4; i++) {
    await prisma.peticio.create({
      data: {
        id_centre: centroBrossa.id_centre,
        id_taller: creadosTallers[i].id_taller,
        alumnes_aprox: 10 + i,
        estat: i === 0 ? 'Aprovada' : 'Pendent',
        modalitat: creadosTallers[i].modalitat,
        prof1_id: profesBrossa[i % profesBrossa.length].id_professor,
        comentaris: `Sol·licitud de prova ${i+1} per al centre Brossa.`
      }
    });
  }

  // Peticiones para Pau Claris
  for (let i = 0; i < 4; i++) {
    await prisma.peticio.create({
      data: {
        id_centre: centroPauClaris.id_centre,
        id_taller: creadosTallers[creadosTallers.length - 1 - i].id_taller,
        alumnes_aprox: 8 + i,
        estat: 'Pendent',
        modalitat: creadosTallers[creadosTallers.length - 1 - i].modalitat,
        prof1_id: profesClaris[i % profesClaris.length].id_professor,
        comentaris: `Sol·licitud de prova ${i+1} per al centre Pau Claris.`
      }
    });
  }

  // 9. FASES DEL PROGRAMA (Dinámicas)
  console.log('🗓️ Creando Fases del Programa...');
  const now = new Date();
  const currentYear = now.getFullYear(); // 2026
  const prevYear = currentYear - 1; // 2025

  await prisma.fase.create({
    data: {
      nom: PHASES.SOLICITUD,
      descripcio: 'Fase inicial on els centres sol·liciten tallers i indiquen nombre d\'alumnes.',
      data_inici: new Date(`${prevYear}-09-01`),
      data_fi: new Date(`${currentYear}-02-15`), // Activa ahora (Enero 2026)
      activa: true,
      ordre: 1
    }
  });

  await prisma.fase.create({
    data: {
      nom: PHASES.PLANIFICACION,
      descripcio: 'Planificació i assignació de tallers.',
      data_inici: new Date(`${currentYear}-02-16`),
      data_fi: new Date(`${currentYear}-03-15`),
      activa: false,
      ordre: 2
    }
  });

  await prisma.fase.create({
    data: {
      nom: PHASES.EJECUCION,
      descripcio: 'Execució dels tallers als centres.',
      data_inici: new Date(`${currentYear}-03-16`),
      data_fi: new Date(`${currentYear}-06-15`),
      activa: false,
      ordre: 3
    }
  });

  await prisma.fase.create({
    data: {
      nom: PHASES.CIERRE,
      descripcio: 'Tancament i avaluació.',
      data_inici: new Date(`${currentYear}-06-16`),
      data_fi: new Date(`${currentYear}-07-31`),
      activa: false,
      ordre: 4
    }
  });
  console.log('✅ Seed finalizado con éxito. Listo para pruebas manuales.');
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });