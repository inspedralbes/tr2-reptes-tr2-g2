import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const PHASES = {
  SOLICITUD: 'Solicitud e Inscripción',
  PLANIFICACION: 'Planificación y Asignación',
  EJECUCION: 'Ejecución y Seguimiento',
  CIERRE: 'Cierre y Evaluación'
} as const;

async function cleanDatabase() {
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
      // Ignorar si la tabla no existe o hay error de truncado
    }
  }
}

async function seedInfrastructure() {
  console.log('🏗️ Generando roles y sectores...');
  const rolAdmin = await prisma.rol.create({ data: { nom_rol: 'ADMIN' } });
  const rolCoord = await prisma.rol.create({ data: { nom_rol: 'COORDINADOR' } });
  const rolProfe = await prisma.rol.create({ data: { nom_rol: 'PROFESSOR' } });

  const sectorTecno = await prisma.sector.create({ data: { nom: 'Transformació Digital' } });
  const sectorCreacio = await prisma.sector.create({ data: { nom: 'Creació Artística' } });
  const sectorIndus = await prisma.sector.create({ data: { nom: 'Industrial i Logística' } });

  return { 
    roles: { rolAdmin, rolCoord, rolProfe }, 
    sectors: { sectorTecno, sectorCreacio, sectorIndus } 
  };
}

async function seedUsers(roles: any, passDefault: string) {
  console.log('👥 Generando usuarios y centros...');
  
  // 1. Admin Global
  await prisma.usuari.create({
    data: {
      nom_complet: 'Administrador Global',
      email: 'admin@admin.com',
      password_hash: passDefault,
      id_rol: roles.rolAdmin.id_rol
    }
  });

  // 2. Centro Joan Brossa
  const centroBrossa = await prisma.centre.create({
    data: { 
      codi_centre: '08014231', 
      nom: 'Institut Joan Brossa', 
      email_contacte: 'a8014231@xtec.cat',
      adreca: 'Carrer de la Mare de Déu del Port, 397',
      telefon_contacte: '934 32 30 54'
    }
  });
  await prisma.usuari.create({
    data: {
      nom_complet: 'Coord. Joan Brossa',
      email: 'coordinacion@brossa.cat',
      password_hash: passDefault,
      id_rol: roles.rolCoord.id_rol,
      id_centre: centroBrossa.id_centre
    }
  });

  // 3. Centro Pau Claris
  const centroPauClaris = await prisma.centre.create({
    data: { 
      codi_centre: '08013147', 
      nom: 'Institut Pau Claris', 
      email_contacte: 'a8013147@xtec.cat',
      adreca: 'Passeig de Lluís Companys, 18',
      telefon_contacte: '932 68 02 11'
    }
  });
  await prisma.usuari.create({
    data: {
      nom_complet: 'Coord. Pau Claris',
      email: 'coordinacion@pauclaris.cat',
      password_hash: passDefault,
      id_rol: roles.rolCoord.id_rol,
      id_centre: centroPauClaris.id_centre
    }
  });

  // ... (rest of the professors and students logic)
  const profesBrossa = [];
  const profesClaris = [];

  for (let i = 1; i <= 4; i++) {
    const emailB = `prof.b${i}@brossa.cat`;
    const userB = await prisma.usuari.create({
      data: {
        nom_complet: `Professor Brossa ${i}`,
        email: emailB,
        password_hash: passDefault,
        id_rol: roles.rolProfe.id_rol,
        id_centre: centroBrossa.id_centre
      }
    });
    const pb = await prisma.professor.create({
      data: { nom: `Professor Brossa ${i}`, contacte: emailB, id_centre: centroBrossa.id_centre, id_usuari: userB.id_usuari }
    });
    profesBrossa.push(pb);

    const emailP = `prof.p${i}@pauclaris.cat`;
    const userP = await prisma.usuari.create({
      data: {
        nom_complet: `Professor Claris ${i}`,
        email: emailP,
        password_hash: passDefault,
        id_rol: roles.rolProfe.id_rol,
        id_centre: centroPauClaris.id_centre
      }
    });
    const pc = await prisma.professor.create({
      data: { nom: `Professor Claris ${i}`, contacte: emailP, id_centre: centroPauClaris.id_centre, id_usuari: userP.id_usuari }
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

  return { centroBrossa, centroPauClaris, profesBrossa, profesClaris };
}

async function seedTallers(sectors: any) {
  console.log('📚 Generando catálogo de talleres...');
  const tallers = [
    { titol: 'Robòtica i IoT', sector: sectors.sectorTecno.id_sector, modalitat: 'A', cap: 10, icona: 'ROBOT' },
    { titol: 'Cinema Digital', sector: sectors.sectorCreacio.id_sector, modalitat: 'B', cap: 8, icona: 'FILM' },
    { titol: 'Impressió 3D', sector: sectors.sectorIndus.id_sector, modalitat: 'A', cap: 7, icona: 'TOOLS' },
    { titol: 'Desenvolupament Web', sector: sectors.sectorTecno.id_sector, modalitat: 'C', cap: 6, icona: 'CODE' },
    { titol: 'Disseny Gràfic', sector: sectors.sectorCreacio.id_sector, modalitat: 'B', cap: 4, icona: 'PAINT' },
    { titol: 'Realitat Virtual', sector: sectors.sectorTecno.id_sector, modalitat: 'A', cap: 8, icona: 'GEAR' }, 
    { titol: 'Energies Renovables', sector: sectors.sectorIndus.id_sector, modalitat: 'B', cap: 10, icona: 'LEAF' }
  ];

  const creadosTallers = [];
  for (const t of tallers) {
    const nuevo = await prisma.taller.create({
      data: {
        titol: t.titol,
        modalitat: t.modalitat as any,
        id_sector: t.sector,
        durada_h: 3,
        places_maximes: t.cap,
        icona: t.icona,
        descripcio: `Exploració pràctica de ${t.titol}.`
      }
    });
    creadosTallers.push(nuevo);
  }
  return creadosTallers;
}

async function seedPeticions(centros: any, tallers: any, profes: any) {
  console.log('📝 Generando peticiones de centros...');
  
  // Peticiones para Joan Brossa
  for (let i = 0; i < 4; i++) {
    await prisma.peticio.create({
      data: {
        id_centre: centros.centroBrossa.id_centre,
        id_taller: tallers[i].id_taller,
        alumnes_aprox: 10 + i,
        estat: i === 0 ? 'Aprovada' : 'Pendent',
        modalitat: tallers[i].modalitat,
        prof1_id: profes.profesBrossa[i % profes.profesBrossa.length].id_professor,
        comentaris: `Sol·licitud de prova ${i+1} per al centre Brossa.`
      }
    });
  }

  // Peticiones para Pau Claris
  for (let i = 0; i < 4; i++) {
    await prisma.peticio.create({
      data: {
        id_centre: centros.centroPauClaris.id_centre,
        id_taller: tallers[tallers.length - 1 - i].id_taller,
        alumnes_aprox: 8 + i,
        estat: 'Pendent',
        modalitat: tallers[tallers.length - 1 - i].modalitat,
        prof1_id: profes.profesClaris[i % profes.profesClaris.length].id_professor,
        comentaris: `Sol·licitud de prova ${i+1} per al centre Pau Claris.`
      }
    });
  }
}

async function seedFases() {
  console.log('🗓️ Creando fases del programa...');
  const now = new Date();
  const currentYear = now.getFullYear();
  const prevYear = currentYear - 1;

  const fasesData = [
    {
      nom: PHASES.SOLICITUD,
      descripcio: 'Fase inicial on els centres sol·liciten tallers i indiquen nombre d\'alumnes.',
      data_inici: new Date(`${prevYear}-09-01`),
      data_fi: new Date(`${currentYear}-02-15`),
      activa: true,
      ordre: 1
    },
    {
      nom: PHASES.PLANIFICACION,
      descripcio: 'Planificació i assignació de tallers.',
      data_inici: new Date(`${currentYear}-02-16`),
      data_fi: new Date(`${currentYear}-03-15`),
      activa: false,
      ordre: 2
    },
    {
      nom: PHASES.EJECUCION,
      descripcio: 'Execució dels tallers als centres.',
      data_inici: new Date(`${currentYear}-03-16`),
      data_fi: new Date(`${currentYear}-06-15`),
      activa: false,
      ordre: 3
    },
    {
      nom: PHASES.CIERRE,
      descripcio: 'Tancament i avaluació.',
      data_inici: new Date(`${currentYear}-06-16`),
      data_fi: new Date(`${currentYear}-07-31`),
      activa: false,
      ordre: 4
    }
  ];

  for (const fase of fasesData) {
    await prisma.fase.create({ data: fase });
  }
}

async function seedSessions(assignments: any[]) {
  console.log('📅 Generando sesiones de talleres...');
  const now = new Date();
  
  for (const a of assignments) {
    if (a.data_inici) {
      // Creamos 3 sesiones espaciadas una semana
      for (let i = 0; i < 3; i++) {
        const dataSessio = new Date(a.data_inici);
        dataSessio.setDate(dataSessio.getDate() + (i * 7));
        
        await prisma.sessio.create({
          data: {
            id_assignacio: a.id_assignacio,
            data_sessio: dataSessio,
            hora_inici: '09:00',
            hora_fi: '13:00'
          }
        });
      }
    }
  }
}

async function main() {
  console.log('🌱 Iniciando Seed final para el programa Iter...');
  
  await cleanDatabase();
  
  const infra = await seedInfrastructure();
  
  const salt = await bcrypt.genSalt(10);
  const passDefault = await bcrypt.hash('Iter@1234', salt);
  
  const centrosData = await seedUsers(infra.roles, passDefault);
  const tallers = await seedTallers(infra.sectors);
  
  await seedPeticions(centrosData, tallers, centrosData);
  await seedFases();

  // Necesitamos crear algunas asignaciones reales para ver sesiones
  console.log('🔗 Generando asignaciones de prueba...');
  const assignacions = [];
  const brossaTaller1 = await prisma.assignacio.create({
    data: {
      id_centre: centrosData.centroBrossa.id_centre,
      id_taller: tallers[0].id_taller,
      data_inici: new Date(),
      data_fi: new Date(new Date().setDate(new Date().getDate() + 30)),
      estat: 'En_curs'
    }
  });
  assignacions.push(brossaTaller1);

  const pauTaller1 = await prisma.assignacio.create({
    data: {
      id_centre: centrosData.centroPauClaris.id_centre,
      id_taller: tallers[1].id_taller,
      data_inici: new Date(),
      data_fi: new Date(new Date().setDate(new Date().getDate() + 30)),
      estat: 'En_curs'
    }
  });
  assignacions.push(pauTaller1);

  await seedSessions(assignacions);

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