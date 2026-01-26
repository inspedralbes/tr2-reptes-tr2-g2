import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const PHASES = {
  SOLICITUD: 'Sol·licitud i Inscripció',
  PLANIFICACION: 'Planificació i Assignació',
  EJECUCION: 'Execució i Seguiment',
  CIERRE: 'Tancament i Avaluació'
} as const;

async function cleanDatabase() {
  console.log('🧹 Netejant base de dades...');
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
  console.log('🏗️ Generant rols i sectors...');
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
  console.log('👥 Generant usuaris i centres...');
  
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

  const brossaProfsNames = ['Laura Martínez', 'Jordi Soler', 'Marta Vila', 'Pere Gomis'];
  const clarisProfsNames = ['Anna Ferrer', 'Marc Dalmau', 'Laia Puig', 'Sergi Vidal'];

  for (let i = 0; i < 4; i++) {
    const name = brossaProfsNames[i];
    const email = `${name.toLowerCase().replace(' ', '.').normalize("NFD").replace(/[\u0300-\u036f]/g, "")}@brossa.cat`;
    const userB = await prisma.usuari.create({
      data: {
        nom_complet: name,
        email: email,
        password_hash: passDefault,
        id_rol: roles.rolProfe.id_rol,
        id_centre: centroBrossa.id_centre
      }
    });
    const pb = await prisma.professor.create({
      data: { nom: name, contacte: email, id_centre: centroBrossa.id_centre, id_usuari: userB.id_usuari }
    });
    profesBrossa.push(pb);

    const nameClaris = clarisProfsNames[i];
    const emailC = `${nameClaris.toLowerCase().replace(' ', '.').normalize("NFD").replace(/[\u0300-\u036f]/g, "")}@pauclaris.cat`;
    const userP = await prisma.usuari.create({
      data: {
        nom_complet: nameClaris,
        email: emailC,
        password_hash: passDefault,
        id_rol: roles.rolProfe.id_rol,
        id_centre: centroPauClaris.id_centre
      }
    });
    const pc = await prisma.professor.create({
      data: { nom: nameClaris, contacte: emailC, id_centre: centroPauClaris.id_centre, id_usuari: userP.id_usuari }
    });
    profesClaris.push(pc);
  }

  const brossaStudents = [
    { n: 'Pol', c: 'Garcia' }, { n: 'Nuria', c: 'Roca' }, { n: 'Arnau', c: 'Font' }, 
    { n: 'Julia', c: 'Serra' }, { n: 'Oriol', c: 'Mas' }, { n: 'Clara', c: 'Pons' }, 
    { n: 'Nil', c: 'Bosch' }, { n: 'Emma', c: 'Sala' }, { n: 'Aleix', c: 'Camps' }, 
    { n: 'Ona', c: 'Valls' }
  ];

  const clarisStudents = [
    { n: 'Paula', c: 'Martí' }, { n: 'Eric', c: 'Torres' }, { n: 'Marina', c: 'Gil' }, 
    { n: 'Jan', c: 'Costa' }, { n: 'Aina', c: 'Ramos' }, { n: 'Biel', c: 'Rovira' }, 
    { n: 'Carla', c: 'Mola' }, { n: 'David', c: 'Romeu' }, { n: 'Sara', c: 'Canals' }, 
    { n: 'Roger', c: 'Sants' }
  ];

  for (let i = 0; i < 10; i++) {
    await prisma.alumne.create({
      data: { 
        nom: brossaStudents[i].n, 
        cognoms: brossaStudents[i].c, 
        idalu: `B${100+i}`, 
        curs: '4t ESO', 
        id_centre_procedencia: centroBrossa.id_centre 
      }
    });
    await prisma.alumne.create({
      data: { 
        nom: clarisStudents[i].n, 
        cognoms: clarisStudents[i].c, 
        idalu: `P${100+i}`, 
        curs: '3r ESO', 
        id_centre_procedencia: centroPauClaris.id_centre 
      }
    });
  }

  return { centroBrossa, centroPauClaris, profesBrossa, profesClaris };
}

async function seedTallers(sectors: any) {
  console.log('📚 Generant catàleg de tallers...');
  const tallers = [
    { 
      titol: 'Robòtica i IoT', 
      sector: sectors.sectorTecno.id_sector, 
      modalitat: 'A', 
      cap: 10, 
      icona: 'ROBOT',
      schedule: [
        { dayOfWeek: 1, startTime: "09:00", endTime: "11:00" }, 
        { dayOfWeek: 3, startTime: "09:00", endTime: "11:00" }  
      ]
    },
    { 
      titol: 'Cinema Digital', 
      sector: sectors.sectorCreacio.id_sector, 
      modalitat: 'B', 
      cap: 8, 
      icona: 'FILM',
      schedule: [
        { dayOfWeek: 2, startTime: "15:00", endTime: "18:00" },
        { dayOfWeek: 4, startTime: "15:00", endTime: "18:00" } 
      ]
    },
    { 
      titol: 'Impressió 3D', 
      sector: sectors.sectorIndus.id_sector, 
      modalitat: 'A', 
      cap: 7, 
      icona: 'TOOLS',
      schedule: [
        { dayOfWeek: 5, startTime: "08:00", endTime: "12:00" } 
      ]
    },
    { 
      titol: 'Desenvolupament Web', 
      sector: sectors.sectorTecno.id_sector, 
      modalitat: 'C', 
      cap: 6, 
      icona: 'CODE',
      schedule: [
         { dayOfWeek: 1, startTime: "10:00", endTime: "13:00" },
         { dayOfWeek: 2, startTime: "10:00", endTime: "13:00" }
      ]
    },
    { 
      titol: 'Disseny Gràfic', 
      sector: sectors.sectorCreacio.id_sector, 
      modalitat: 'B', 
      cap: 4, 
      icona: 'PAINT',
      schedule: [
        { dayOfWeek: 3, startTime: "16:00", endTime: "19:00" }
      ]
    },
    { 
      titol: 'Realitat Virtual', 
      sector: sectors.sectorTecno.id_sector, 
      modalitat: 'A', 
      cap: 8, 
      icona: 'GEAR',
      schedule: [
        { dayOfWeek: 4, startTime: "09:00", endTime: "11:00" },
        { dayOfWeek: 5, startTime: "09:00", endTime: "11:00" }
      ]
    }, 
    { 
      titol: 'Energies Renovables', 
      sector: sectors.sectorIndus.id_sector, 
      modalitat: 'B', 
      cap: 10, 
      icona: 'LEAF',
      schedule: [
        { dayOfWeek: 1, startTime: "12:00", endTime: "14:00" },
        { dayOfWeek: 3, startTime: "12:00", endTime: "14:00" }
      ]
    }
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
        descripcio: `Exploració pràctica de ${t.titol}.`,
        dies_execucio: t.schedule
      }
    });
    creadosTallers.push(nuevo);
  }
  return creadosTallers;
}


async function seedFases() {
  console.log('🗓️ Creant fases del programa...');
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

async function seedCompetencies() {
  console.log('🧠 Generant competències...');
  const tecniques = [
    "Capacitat de resoldre situacions independentment",
    "Reconeixement d'eines",
    "Responsabilitat en l'execució"
  ];
  const transversals = [
    "Autoconfiança",
    "Treball en equip",
    "Disposició a l'aprenentatge",
    "Actitud responsable",
    "Iniciativa",
    "Comunicació amb el responsable"
  ];

  for (const c of tecniques) {
    await prisma.competencia.create({ data: { nom: c, tipus: 'Tecnica' } });
  }
  for (const c of transversals) {
    await prisma.competencia.create({ data: { nom: c, tipus: 'Transversal' } });
  }
}

async function seedQuestionnaires() {
  console.log('📝 Generant qüestionaris...');
  
  // Qüestionari de Qualitat del Taller (Professor)
  const qTaller = await prisma.modelQuestionari.create({
    data: {
      titol: "Qüestionari de Qualitat del Taller",
      destinatari: "PROFESSOR",
      preguntes: {
        create: [
          { enunciat: "Satisfacció general amb el taller", tipus_resposta: "Likert_1_5" },
          { enunciat: "Valoració de l'organització i recursos", tipus_resposta: "Likert_1_5" },
          { enunciat: "Observacions i suggeriments", tipus_resposta: "Oberta" }
        ]
      }
    }
  });
}
async function main() {
  console.log('🌱 Iniciant Seed final per al programa Iter...');
  
  await cleanDatabase();
  
  const infra = await seedInfrastructure();
  
  const salt = await bcrypt.genSalt(10);
  const passDefault = await bcrypt.hash('Iter@1234', salt);
  
  const centrosData = await seedUsers(infra.roles, passDefault);
  const tallers = await seedTallers(infra.sectors);
  
  await seedFases();
  await seedCompetencies();
  await seedQuestionnaires();
  // await seedAssignments(centrosData, tallers);

  console.log('✅ Seed finalitzat amb èxit (Amb dades de prova i sessions).');
}

// function seedAssignments has been removed

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });