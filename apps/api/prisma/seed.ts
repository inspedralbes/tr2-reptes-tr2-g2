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
  console.log('🌱 Iniciando Seed para PostgreSQL...');

  // 1. LIMPIEZA EXHAUSTIVA CON REINICIO DE IDENTIDADES
  console.log('🧹 Limpiando base de datos...');
  const tables = [
    'respostes_questionari', 'preguntes', 'model_questionaris', 'avaluacio_competencial',
    'assistencia', 'inscripcions', 'checklist_assignacio', 'assignacio_professors',
    'assignacions', 'peticions', 'tallers', 'alumnes', 'professors', 'logs_auditoria',
    'calendari_events', 'fases', 'usuaris', 'centres', 'sectors', 'rols', 'competencies'
  ];

  for (const table of tables) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE`);
  }

  console.log('🧹 Base de datos limpiada.');

  // 2. CREAR ROLES
  const rolAdmin = await prisma.rol.create({ data: { nom_rol: 'ADMIN' } });
  const rolCoord = await prisma.rol.create({ data: { nom_rol: 'COORDINADOR' } });
  const rolProfe = await prisma.rol.create({ data: { nom_rol: 'PROFESSOR' } });

  // 3. CREAR SECTORES
  console.log('🏗️ Creando Sectores...');
  const sectorsData = [
    { nom: 'Agroalimentari' },                     // 0
    { nom: 'Manufacturer' },                       // 1
    { nom: 'Indústria del Metall i la Mobilitat' },// 2
    { nom: 'Construcció' },                        // 3
    { nom: 'Químic' },                             // 4
    { nom: 'Serveis a les empreses' },             // 5
    { nom: 'Salut i atenció a les persones' },     // 6
    { nom: 'Oci i Benestar' },                     // 7
    { nom: 'Energia i Sostenibilitat' },           // 8
    { nom: 'Transformació Digital' },              // 9
    { nom: 'Creació Artística' }                   // 10
  ];

  const creadosSectors = [];
  for (const s of sectorsData) {
    const created = await prisma.sector.create({ data: s });
    creadosSectors.push(created);
  }

  const sectorAgro = creadosSectors[0];
  const sectorManufacturer = creadosSectors[1];
  const sectorMobilitat = creadosSectors[2]; 
  const sectorConstruccio = creadosSectors[3];
  // const sectorQuimic = creadosSectors[4];
  // const sectorServeis = creadosSectors[5];
  const sectorSalut = creadosSectors[6];
  const sectorOci = creadosSectors[7]; 
  const sectorSostenibilitat = creadosSectors[8];
  const sectorDigital = creadosSectors[9];
  const sectorCreacio = creadosSectors[10];

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

  // 7. CREAR TALLERES (Actualitzat amb la llista completa)
  console.log('🛠️ Creando Talleres...');
  const tallersData = [
    // 1. Circ i oficis de les arts escèniques
    { titol: 'Circ i oficis de les arts escèniques', modalitat: 'A', id_sector: sectorCreacio.id_sector, ambit: 'Escènic', durada_h: 2, places_maximes: 16, descripcio_curta: 'Circ i oficis de les arts escèniques' },
    { titol: 'Circ i oficis de les arts escèniques', modalitat: 'C', id_sector: sectorCreacio.id_sector, ambit: 'Escènic', durada_h: 3, places_maximes: 16, descripcio_curta: 'Circ i oficis de les arts escèniques' },

    // 2. Fusta
    { titol: 'Fusta', modalitat: 'A', id_sector: sectorManufacturer.id_sector, ambit: 'Indústria - Manufactura', durada_h: 2, places_maximes: 16, descripcio_curta: 'Impulsem (c/ Tàpies)' },
    { titol: 'Fusta', modalitat: 'C', id_sector: sectorManufacturer.id_sector, ambit: 'Indústria - Manufactura', durada_h: 3, places_maximes: 16, descripcio_curta: 'Impulsem (c/ Tàpies)' },

    // 3. Cuina comunitària
    { titol: 'Cuina comunitària', modalitat: 'A', id_sector: sectorAgro.id_sector, ambit: 'Hoteleria - Alimentació', durada_h: 3, places_maximes: 16, descripcio_curta: 'Granja Escola Sinai / Mercat Sant Antoni' },
    { titol: 'Cuina comunitària', modalitat: 'C', id_sector: sectorAgro.id_sector, ambit: 'Hoteleria - Alimentació', durada_h: 3, places_maximes: 16, descripcio_curta: 'Granja Escola Sinai / Mercat Sant Antoni' },

    // 4. Metall i artesania
    { titol: 'Metall i artesania', modalitat: 'A', id_sector: sectorMobilitat.id_sector, ambit: 'Indústria 4.0', durada_h: 2, places_maximes: 16, descripcio_curta: 'Impulsem (c/ Tàpies)' },
    { titol: 'Metall i artesania', modalitat: 'C', id_sector: sectorMobilitat.id_sector, ambit: 'Indústria 4.0', durada_h: 3, places_maximes: 16, descripcio_curta: 'Impulsem (c/ Tàpies)' },

    // 5. Serigrafia
    { titol: 'Serigrafia', modalitat: 'A', id_sector: sectorManufacturer.id_sector, ambit: 'Indústria - Manufactura', durada_h: 2, places_maximes: 16, descripcio_curta: 'Impulsem (c/ Tàpies)' },
    { titol: 'Serigrafia', modalitat: 'C', id_sector: sectorManufacturer.id_sector, ambit: 'Indústria - Manufactura', durada_h: 3, places_maximes: 16, descripcio_curta: 'Impulsem (c/ Tàpies)' },

    // 6. Oficis gastronòmics
    { titol: 'Oficis gastronòmics', modalitat: 'A', id_sector: sectorOci.id_sector, ambit: 'Oci i Benestar - Restauració', durada_h: 2, places_maximes: 16, descripcio_curta: 'Impulsem (c/ Tàpies)' },
    { titol: 'Oficis gastronòmics', modalitat: 'C', id_sector: sectorOci.id_sector, ambit: 'Oci i Benestar - Restauració', durada_h: 3, places_maximes: 16, descripcio_curta: 'Impulsem (c/ Tàpies)' },

    // 7. TMB es mou per l’educació
    { titol: 'TMB es mou per l’educació', modalitat: 'A', id_sector: sectorMobilitat.id_sector, ambit: 'Indústria 4.0 - Mobilitat', durada_h: 2, places_maximes: 16, descripcio_curta: 'Instal·lacions TMB (La Sagrera/Zona Franca)' },
    { titol: 'TMB es mou per l’educació', modalitat: 'C', id_sector: sectorMobilitat.id_sector, ambit: 'Indústria 4.0 - Mobilitat', durada_h: 3, places_maximes: 16, descripcio_curta: 'Instal·lacions TMB (La Sagrera/Zona Franca)' },

    // 8. Vela
    { titol: 'Vela', modalitat: 'A', id_sector: sectorOci.id_sector, ambit: 'Esportiu - Oci', durada_h: 3, places_maximes: 16, descripcio_curta: 'Centre Municipal de Vela (Port Olímpic)' },
    { titol: 'Vela', modalitat: 'C', id_sector: sectorOci.id_sector, ambit: 'Esportiu - Oci', durada_h: 3, places_maximes: 16, descripcio_curta: 'Centre Municipal de Vela (Port Olímpic)' },

    // 9. SmArt: professions creatives
    { titol: 'SmArt: professions creatives', modalitat: 'A', id_sector: sectorCreacio.id_sector, ambit: 'Indústries creatives', durada_h: 2, places_maximes: 16, descripcio_curta: 'Visitant professionals' },

    // 10. Imatge personal per a tothom
    { titol: 'Imatge personal per a tothom', modalitat: 'B', id_sector: sectorOci.id_sector, ambit: 'Oci i Benestar', durada_h: 2, places_maximes: 20, descripcio_curta: 'Al propi centre / Centre Colomer (si és C)' },

    // 11. Vinyeta a vinyeta (Còmic)
    { titol: 'Vinyeta a vinyeta (Còmic)', modalitat: 'B', id_sector: sectorCreacio.id_sector, ambit: 'Artístic', durada_h: 2, places_maximes: 20, descripcio_curta: 'Al propi centre' },

    // 12. Internet de les coses (IoT)
    { titol: 'Internet de les coses (IoT)', modalitat: 'B', id_sector: sectorDigital.id_sector, ambit: 'Tecnològic - Indústria 4.0', durada_h: 2, places_maximes: 20, descripcio_curta: 'Al propi centre' },

    // 13. Tecnologia digital (3D/Làser)
    { titol: 'Tecnologia digital (3D/Làser)', modalitat: 'B', id_sector: sectorDigital.id_sector, ambit: 'Digital - Indústria', durada_h: 2, places_maximes: 20, descripcio_curta: 'Al propi centre' },

    // 14. Fem jocs a l’aula (Gamificació)
    { titol: 'Fem jocs a l’aula (Gamificació)', modalitat: 'B', id_sector: sectorCreacio.id_sector, ambit: 'Indústries creatives', durada_h: 2, places_maximes: 20, descripcio_curta: 'Al propi centre' },

    // 15. Descobrim la nostra història
    { titol: 'Descobrim la nostra història', modalitat: 'B', id_sector: sectorCreacio.id_sector, ambit: 'Científic - Humanístic', durada_h: 2, places_maximes: 20, descripcio_curta: 'Al propi centre (Arqueologia)' },

    // 16. Taller de cinema / Fem cinema
    { titol: 'Taller de cinema / Fem cinema', modalitat: 'B', id_sector: sectorCreacio.id_sector, ambit: 'Indústries creatives', durada_h: 2, places_maximes: 20, descripcio_curta: 'Rambla Santa Mònica (UGT)' },
    { titol: 'Taller de cinema / Fem cinema', modalitat: 'C', id_sector: sectorCreacio.id_sector, ambit: 'Indústries creatives', durada_h: 3, places_maximes: 16, descripcio_curta: 'Rambla Santa Mònica (UGT)' },

    // 17. Interpretació teatral
    { titol: 'Interpretació teatral', modalitat: 'B', id_sector: sectorCreacio.id_sector, ambit: 'Arts escèniques', durada_h: 2, places_maximes: 20, descripcio_curta: 'Al propi centre' },

    // 18. Percussió, moviment, música
    { titol: 'Percussió, moviment, música', modalitat: 'B', id_sector: sectorCreacio.id_sector, ambit: 'Artístic - Musical', durada_h: 2, places_maximes: 20, descripcio_curta: 'Artixoc (Rambla de Badal)' },
    { titol: 'Percussió, moviment, música', modalitat: 'C', id_sector: sectorCreacio.id_sector, ambit: 'Artístic - Musical', durada_h: 2, places_maximes: 16, descripcio_curta: 'Artixoc (Rambla de Badal)' },

    // 19. Fem moda sostenible
    { titol: 'Fem moda sostenible', modalitat: 'B', id_sector: sectorSostenibilitat.id_sector, ambit: 'Moda - Sostenibilitat', durada_h: 2, places_maximes: 20, descripcio_curta: 'Artixoc (Ciutat Vella)' },
    { titol: 'Fem moda sostenible', modalitat: 'C', id_sector: sectorSostenibilitat.id_sector, ambit: 'Moda - Sostenibilitat', durada_h: 2, places_maximes: 16, descripcio_curta: 'Artixoc (Ciutat Vella)' },

    // 20. El rap i Hip Hop en català
    { titol: 'El rap i Hip Hop en català', modalitat: 'B', id_sector: sectorCreacio.id_sector, ambit: 'Música - Ritmes urbans', durada_h: 2, places_maximes: 20, descripcio_curta: 'Artixoc' },
    { titol: 'El rap i Hip Hop en català', modalitat: 'C', id_sector: sectorCreacio.id_sector, ambit: 'Música - Ritmes urbans', durada_h: 2, places_maximes: 16, descripcio_curta: 'Artixoc' },

    // 21. Tecnologia per millorar el món
    { titol: 'Tecnologia per millorar el món', modalitat: 'B', id_sector: sectorDigital.id_sector, ambit: 'Tecnològic (Scratch)', durada_h: 2, places_maximes: 20, descripcio_curta: 'Al propi centre' },

    // 22. Mur-Art / Murals de barri
    { titol: 'Mur-Art / Murals de barri', modalitat: 'B', id_sector: sectorCreacio.id_sector, ambit: 'Artístic - Social', durada_h: 2, places_maximes: 20, descripcio_curta: 'Al propi centre o Espai públic' },
    { titol: 'Mur-Art / Murals de barri', modalitat: 'C', id_sector: sectorCreacio.id_sector, ambit: 'Artístic - Social', durada_h: 3, places_maximes: 16, descripcio_curta: 'Al propi centre o Espai públic' },

    // 23. Retratistes de la ciutat
    { titol: 'Retratistes de la ciutat', modalitat: 'B', id_sector: sectorCreacio.id_sector, ambit: 'Artístic - Social', durada_h: 2, places_maximes: 20, descripcio_curta: 'Abaoaqu / Itinerant' },
    { titol: 'Retratistes de la ciutat', modalitat: 'C', id_sector: sectorCreacio.id_sector, ambit: 'Artístic - Social', durada_h: 3, places_maximes: 16, descripcio_curta: 'Abaoaqu / Itinerant' },

    // 24. Intervencions artístiques (IAC)
    { titol: 'Intervencions artístiques (IAC)', modalitat: 'B', id_sector: sectorConstruccio.id_sector, ambit: 'Construcció - Artístic', durada_h: 2, places_maximes: 20, descripcio_curta: 'Al propi centre' },

    // 25. Energies Renovables
    { titol: 'Energies Renovables', modalitat: 'C', id_sector: sectorSostenibilitat.id_sector, ambit: 'Indústria - Sostenibilitat', durada_h: 3, places_maximes: 16, descripcio_curta: 'Indústria - Sostenibilitat' },

    // 26. Talent femení tecnològic
    { titol: 'Talent femení tecnològic', modalitat: 'C', id_sector: sectorDigital.id_sector, ambit: 'Digital (Només noies)', durada_h: 3, places_maximes: 16, descripcio_curta: 'INS Escola del Treball' },

    // 27. Estètica
    { titol: 'Estètica', modalitat: 'C', id_sector: sectorOci.id_sector, ambit: 'Oci i Benestar', durada_h: 3, places_maximes: 16, descripcio_curta: 'Oci i Benestar' },

    // 28. Taller de costura
    { titol: 'Taller de costura', modalitat: 'C', id_sector: sectorManufacturer.id_sector, ambit: 'Moda - Manufactura', durada_h: 3, places_maximes: 16, descripcio_curta: 'INS Anna Gironella de Mundet' },

    // 29. Instal·lacions domèstiques
    { titol: 'Instal·lacions domèstiques', modalitat: 'C', id_sector: sectorDigital.id_sector, ambit: 'Indústria avançada', durada_h: 3, places_maximes: 16, descripcio_curta: 'INS Anna Gironella de Mundet' },

    // 30. Perruqueria
    { titol: 'Perruqueria', modalitat: 'C', id_sector: sectorOci.id_sector, ambit: 'Oci i Benestar', durada_h: 3, places_maximes: 16, descripcio_curta: 'Centre Formació Colomer' },

    // 31. Mecànica bàsica de bicicleta
    { titol: 'Mecànica bàsica de bicicleta', modalitat: 'C', id_sector: sectorMobilitat.id_sector, ambit: 'Indústria 4.0', durada_h: 3, places_maximes: 16, descripcio_curta: 'Biciclot (c/ Verneda)' },

    // 32. Xarxes d’aigua potable
    { titol: 'Xarxes d’aigua potable', modalitat: 'C', id_sector: sectorSostenibilitat.id_sector, ambit: 'Indústria - Sostenibilitat', durada_h: 3, places_maximes: 16, descripcio_curta: 'Indústria - Sostenibilitat' },

    // 33. Acompanyament a les persones
    { titol: 'Acompanyament a les persones', modalitat: 'C', id_sector: sectorSalut.id_sector, ambit: 'Sanitari - Serveis', durada_h: 3, places_maximes: 16, descripcio_curta: 'INS Ferran Tallada' },

    // 34. Jardineria
    { titol: 'Jardineria', modalitat: 'C', id_sector: sectorSostenibilitat.id_sector, ambit: 'Medi ambient', durada_h: 3, places_maximes: 16, descripcio_curta: 'ISMAB (c/ Mollerussa)' },

    // 35. Oficis de la mar
    { titol: 'Oficis de la mar', modalitat: 'C', id_sector: sectorAgro.id_sector, ambit: 'Medi ambient - Alimentació', durada_h: 3, places_maximes: 16, descripcio_curta: 'Barceloneta / Cap a mar' },

    // 36. Prepara el teu PC
    { titol: 'Prepara el teu PC', modalitat: 'C', id_sector: sectorDigital.id_sector, ambit: 'Digital - Indústria', durada_h: 3, places_maximes: 16, descripcio_curta: '(A vegades a Escola del Treball)' },

    // 37. Mobilitat i transport bici
    { titol: 'Mobilitat i transport bici', modalitat: 'C', id_sector: sectorOci.id_sector, ambit: 'Esportiu - Social', durada_h: 3, places_maximes: 16, descripcio_curta: 'Biciclot (c/ Verneda)' },

    // 38. De Picasso al Manga
    { titol: 'De Picasso al Manga', modalitat: 'C', id_sector: sectorCreacio.id_sector, ambit: 'Creatiu - Artístic', durada_h: 3, places_maximes: 16, descripcio_curta: 'Museu Picasso' },

    // 39. Tecnolab Makers
    { titol: 'Tecnolab Makers', modalitat: 'C', id_sector: sectorDigital.id_sector, ambit: 'Indústria - Tecnològic', durada_h: 3, places_maximes: 16, descripcio_curta: 'ISMAB (c/ Mollerussa)' },

    // 40. Saber parlar en públic
    { titol: 'Saber parlar en públic', modalitat: 'C', id_sector: sectorCreacio.id_sector, ambit: 'Arts escèniques', durada_h: 3, places_maximes: 16, descripcio_curta: 'Sala Centre de Sant Pere' }
  ];

  const creadosTallers = [];
  for (const t of tallersData) {
    const created = await prisma.taller.create({
      data: {
        titol: t.titol,
        durada_h: t.durada_h,
        places_maximes: t.places_maximes,
        modalitat: t.modalitat as any,
        id_sector: t.id_sector,
        descripcio_curta: t.descripcio_curta,
        ambit: t.ambit
      }
    });
    creadosTallers.push(created);
  }

  const tallerFusta = creadosTallers.find(t => t.titol === 'Fusta' && t.modalitat === 'A')!;

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
  const now = new Date();
  const currentYear = now.getFullYear(); // 2026
  const prevYear = currentYear - 1; // 2025

  const fase1 = await prisma.fase.create({
    data: {
      nom: PHASES.SOLICITUD,
      descripcio: 'Fase inicial on els centres sol·liciten tallers i indiquen nombre d\'alumnes.',
      data_inici: new Date(`${prevYear}-09-01`),
      data_fi: new Date(`${currentYear}-02-15`), // Activa ahora (Enero 2026)
      activa: true,
      ordre: 1
    }
  });

  const fase2 = await prisma.fase.create({
    data: {
      nom: PHASES.PLANIFICACION,
      descripcio: 'Planificació i assignació de tallers.',
      data_inici: new Date(`${currentYear}-02-16`),
      data_fi: new Date(`${currentYear}-03-15`),
      activa: false,
      ordre: 2
    }
  });

  const fase3 = await prisma.fase.create({
    data: {
      nom: PHASES.EJECUCION,
      descripcio: 'Execució dels tallers als centres.',
      data_inici: new Date(`${currentYear}-03-16`),
      data_fi: new Date(`${currentYear}-06-15`),
      activa: false,
      ordre: 3
    }
  });

  const fase4 = await prisma.fase.create({
    data: {
      nom: PHASES.CIERRE,
      descripcio: 'Tancament i avaluació.',
      data_inici: new Date(`${currentYear}-06-16`),
      data_fi: new Date(`${currentYear}-07-31`),
      activa: false,
      ordre: 4
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
      alumnes_aprox: 2,
      estat: 'Pendent',
      modalitat: 'A',
      prof1_id: prof1.id_professor,
      prof2_id: prof2.id_professor
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