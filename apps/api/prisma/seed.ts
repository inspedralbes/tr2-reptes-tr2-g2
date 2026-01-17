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
  console.log('🏗️ Creando Sectores...');
  const sectorsData = [
    { nom: 'Agroalimentari' },
    { nom: 'Manufacturer' },
    { nom: 'Indústria del Metall i la Mobilitat' },
    { nom: 'Construcció' },
    { nom: 'Químic' },
    { nom: 'Serveis a les empreses' },
    { nom: 'Salut i atenció a les persones' },
    { nom: 'Oci i Benestar' },
    { nom: 'Energia i Sostenibilitat' },
    { nom: 'Transformació Digital' },
    { nom: 'Creació Artística' }
  ];

  const creadosSectors = [];
  for (const s of sectorsData) {
    const created = await prisma.sector.create({ data: s });
    creadosSectors.push(created);
  }

  const sectorAgro = creadosSectors[0];
  const sectorMobilitat = creadosSectors[2]; // Metal i Mobilitat
  const sectorOci = creadosSectors[7]; // Oci i Benestar

  // 4. CREAR CENTROS
  console.log('🏫 Creando Centros de Barcelona...');
  const centrosData = [
    { codi_centre: '08077095', nom: 'Institut Escola Mirades', adreca: 'c. de Farnés, 56-72', telefon_contacte: '933585164', email_contacte: 'a8077095@xtec.cat' },
    { codi_centre: '08013147', nom: 'Institut Pau Claris', adreca: 'pg. Lluís Companys, 18', telefon_contacte: '933099417', email_contacte: 'a8013147@xtec.cat' },
    { codi_centre: '08013123', nom: 'Institut Montserrat', adreca: 'c. Copèrnic, 84', telefon_contacte: '932003738', email_contacte: 'a8013123@xtec.cat' },
    { codi_centre: '08013111', nom: 'Institut Fort Pius', adreca: 'c. Ausias Marc, 78', telefon_contacte: '932326909', email_contacte: 'a8013111@xtec.cat' },
    { codi_centre: '08002423', nom: 'Institut Escola Tramuntana', adreca: 'c. Guardiola i Feliu, 7-9', telefon_contacte: '933456816', email_contacte: 'a8002423@xtec.cat' },
    { codi_centre: '08076567', nom: 'Institut Maria Espinalt', adreca: 'c. Llacuna, 82', telefon_contacte: '935160350', email_contacte: 'a8076567@xtec.cat' },
    { codi_centre: '08013135', nom: 'Institut Joan Salvat Papasseit', adreca: 'av. de la Barceloneta, 10', telefon_contacte: '933190805', email_contacte: 'a8013135@xtec.cat' },
    { codi_centre: '08066565', nom: 'Institut el Joncar', adreca: 'c. del Joncar, 35', telefon_contacte: '932213600', email_contacte: 'a8066565@xtec.cat' },
    { codi_centre: '08044958', nom: 'Institut L\'Alzina', adreca: 'ptge. Salvador Riera, 2', telefon_contacte: '933409850', email_contacte: 'a8044958@xtec.cat' },
    { codi_centre: '08035179', nom: 'Institut Salvador Espriu', adreca: 'c. de l\'Arquitectura, 2 (Polígon Gran Via Sud)', telefon_contacte: '933321523', email_contacte: 'a8035179@xtec.cat' },
    { codi_centre: '08045616', nom: 'Institut de Sants', adreca: 'c. Tinent Flomesta, 30', telefon_contacte: '934905105', email_contacte: 'a8045616@xtec.cat' },
    { codi_centre: '08013238', nom: 'Institut Vila de Gràcia', adreca: 'c. Riera de Sant Miquel, 29-31', telefon_contacte: '932370908', email_contacte: 'a8013238@xtec.cat' },
    { codi_centre: '08014231', nom: 'Institut Joan Brossa', adreca: 'av. Mare de Déu de Montserrat, 78', telefon_contacte: '934368903', email_contacte: 'a8014231@xtec.cat' },
    { codi_centre: '08039057', nom: 'Institut Angeleta Ferrer', adreca: 'c. Marina, 193', telefon_contacte: '935575600', email_contacte: 'a8039057@xtec.cat' },
    { codi_centre: '08052839', nom: 'Institut Consell de Cent', adreca: 'c. Carrera, 23', telefon_contacte: '934424048', email_contacte: 'a8052839@xtec.cat' },
    { codi_centre: '08002757', nom: 'Institut Escola Coves d\'en Cimany', adreca: 'c. Coves d\'en Cimany, 42', telefon_contacte: '933585053', email_contacte: 'a8002757@xtec.cat' },
    { codi_centre: '08058222', nom: 'Escola Fàsia - Eixample', adreca: 'ptge. Domingo, 3', telefon_contacte: '932152323', email_contacte: 'a8058222@xtec.cat' },
    { codi_centre: '08039963', nom: 'Escola Fàsia - Sarrià', adreca: 'c. Iradier, 28', telefon_contacte: '934182482', email_contacte: 'a8039963@xtec.cat' },
    { codi_centre: '08072310', nom: 'Institut Escola Rec Comtal', adreca: 'c. Via de Bàrcino, 90', telefon_contacte: '932695525', email_contacte: 'a8072310@xtec.cat' },
    { codi_centre: '08077149', nom: 'Institut Escola Eixample', adreca: 'c. València, 252', telefon_contacte: '932152683', email_contacte: 'a8077149@xtec.cat' },
    { codi_centre: '08013172', nom: 'Institut Josep Serrat i Bonastre', adreca: 'c. Marquès de Santa Anna, 4', telefon_contacte: '932189456', email_contacte: 'a8013172@xtec.cat' },
    { codi_centre: '08052852', nom: 'Institut Flos i Calcat', adreca: 'av. Rio de Janeiro, 11-13', telefon_contacte: '933542961', email_contacte: 'a8052852@xtec.cat' },
    { codi_centre: '08013196', nom: 'Institut Poeta Maragall', adreca: 'c. Provença, 187', telefon_contacte: '934549466', email_contacte: 'a8013196@xtec.cat' },
    { codi_centre: '08075670', nom: 'Institut Escola Trinitat Nova', adreca: 'c. de la Pedrosa, 16', telefon_contacte: '933592500', email_contacte: 'a8075670@xtec.cat' },
    { codi_centre: '08044053', nom: 'Institut Anna Gironella de Mundet', adreca: 'pg. de la Vall d\'Hebron, 171 (Recinte Mundet)', telefon_contacte: '934280292', email_contacte: 'a8044053@xtec.cat' },
    { codi_centre: '08013184', nom: 'Institut Bernat Metge', adreca: 'c. Menorca, 55', telefon_contacte: '933149611', email_contacte: 'a8013184@xtec.cat' },
    { codi_centre: '08033870', nom: 'Institut Puigvert', adreca: 'c. de l\'Escultura, 13', telefon_contacte: '933575253', email_contacte: 'a8033870@xtec.cat' },
    { codi_centre: '08013101', nom: 'Institut Jaume Balmes', adreca: 'c. Pau Claris, 121', telefon_contacte: '934881866', email_contacte: 'a8013101@xtec.cat' },
    { codi_centre: '08075669', nom: 'Institut Escola El Til·ler', adreca: 'pg. Mollerussa, 1', telefon_contacte: '933456947', email_contacte: 'a8075669@xtec.cat' },
    { codi_centre: '08075657', nom: 'Institut Escola Arts', adreca: 'ctr. de la Bordeta, 35', telefon_contacte: '935546594', email_contacte: 'a8075657@xtec.cat' },
    { codi_centre: '08013159', nom: 'Institut Milà i Fontanals', adreca: 'pl. Josep Maria Folch i Torres, s/n', telefon_contacte: '934419965', email_contacte: 'a8013159@xtec.cat' },
    { codi_centre: '08053649', nom: 'Institut Pablo R. Picasso', adreca: 'c. Sant Feliu de Codines, 1', telefon_contacte: '933509908', email_contacte: 'a8053649@xtec.cat' },
    { codi_centre: '08003774', nom: 'Escola Lexia', adreca: 'c. Gomis, 102-104', telefon_contacte: '934170739', email_contacte: 'a8003774@xtec.cat' },
    { codi_centre: '08053157', nom: 'Institut Nou Barris', adreca: 'c. d\'Aiguablava, 121', telefon_contacte: '933538800', email_contacte: 'a8053157@xtec.cat' },
    { codi_centre: '08014206', nom: 'Institut Caterina Albert', adreca: 'c. Rogent, 51', telefon_contacte: '934351512', email_contacte: 'a8014206@xtec.cat' },
    { codi_centre: '08005321', nom: 'CEE La Ginesta', adreca: 'c. de la Via Augusta, 202-226', telefon_contacte: '932014166', email_contacte: 'a8005321@xtec.cat' },
    { codi_centre: '08058143', nom: 'CEE Josep Pla', adreca: 'pg. Fabra i Puig, 406', telefon_contacte: '933596911', email_contacte: 'a8058143@xtec.cat' }
  ];

  const creadosCentres = [];
  for (const c of centrosData) {
    const created = await prisma.centre.create({ data: c });
    creadosCentres.push(created);
  }

  const centroBrossa = creadosCentres.find(c => c.codi_centre === '08014231')!;
  const centroMila = creadosCentres.find(c => c.codi_centre === '08013159')!;

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
    data: { 
      titol: 'Fusta', 
      durada_h: 20, 
      places_maximes: 16, 
      modalitat: 'A', 
      id_sector: sectorAgro.id_sector, 
      descripcio_curta: 'Construcció en fusta',
      ambit: 'Àmbit Medi Ambient i Sostenibilitat' // Ejemplo de ámbito
    }
  });

  const tallerRobotica = await prisma.taller.create({
    data: {
      titol: 'Robòtica Avançada',
      durada_h: 30,
      places_maximes: 12,
      modalitat: 'C',
      id_sector: sectorMobilitat.id_sector,
      descripcio_curta: 'Manteniment industrial i robòtica',
      ambit: 'Àmbit Tecnològic / Indústria 4.0 / Indústria Avançada'
    }
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

  // 9. FASES DEL PROGRAMA (Dinámicas)
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

  // 9.1 HITOS GLOBALES (Enlazados a fases)
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