const { MongoClient, ObjectId } = require("mongodb");
const path = require("path");
const bcrypt = require('bcryptjs'); // Importar bcrypt
const Centro = require('../src/models/centro.model'); // Importar el modelo Centro

require("dotenv").config({ path: path.resolve(__dirname, "../../.env.prod") });

const { 
  DB_HOST, 
  MONGO_PORT, 
  MONGO_INITDB_DATABASE, 
  MONGO_INITDB_ROOT_USERNAME, 
  MONGO_INITDB_ROOT_PASSWORD 
} = process.env;

let uri;

// Lógica para decidir si usamos contraseña o no
if (MONGO_INITDB_ROOT_USERNAME && MONGO_INITDB_ROOT_PASSWORD) {
  // Caso CON autenticación
  uri = `mongodb://${MONGO_INITDB_ROOT_USERNAME}:${MONGO_INITDB_ROOT_PASSWORD}@${DB_HOST}:${MONGO_PORT}/${MONGO_INITDB_DATABASE}?authSource=admin`;
} else {
  // Caso SIN autenticación (Tu caso actual)
  const host = DB_HOST; 
  const port = MONGO_PORT;
  const dbName = MONGO_INITDB_DATABASE;
  
  uri = `mongodb://${host}:${port}/${dbName}`;
}

const client = new MongoClient(uri);

async function seed() {
  try {
    console.log(`🌱 %% Iniciando seed en: ${DB_HOST}:${MONGO_PORT}`);
    
    await client.connect();
    console.log("✅ Conectado a MongoDB");

    const db = client.db(MONGO_INITDB_DATABASE);

    // --- 1. COLECCIÓN TALLERS ---
    const colTallers = db.collection("tallers");
    await colTallers.deleteMany({}); // Limpiar antes de insertar

    const tallersData = [
      {
        titol: "Fusta",
        sector: "Agroalimentari i Manufacturer",
        modalitat: "A",
        trimestre: "1r",
        detalls_tecnics: {
          descripcio: "Exploració a través de la construcció d'un producte.",
          durada_hores: 20,
          places_maximes: "2/16",
          ubicacio_defecte: "Tallers externs ciutat",
        },
        referents_assignats: [],
        dies_execucio: ["dijous"],
      },
      {
        titol: "Imatge personal per a tothom",
        sector: "Oci i Benestar",
        modalitat: "B",
        trimestre: "2n",
        detalls_tecnics: {
          descripcio:
            "Formació específica sobre atenció al client i benestar personal.",
          durada_hores: 20,
          places_maximes: "2/20",
          ubicacio_defecte: "Al propi centre",
        },
        referents_assignats: [],
        dies_execucio: ["dimarts"],
      },
      {
        titol: "Energies Renovables",
        sector: "Energia i Sostenibilitat",
        modalitat: "C",
        trimestre: "2n",
        detalls_tecnics: {
          descripcio:
            "Descoberta de perfils professionals vinculats a la sostenibilitat.",
          durada_hores: 30,
          places_maximes: "5/15",
          ubicacio_defecte: "Institut de Sostenibilitat (ISMAB)",
        },
        referents_assignats: [],
        dies_execucio: ["dijous"],
      },
    ];

    await colTallers.insertMany(tallersData);
    console.log(`📚 ${tallersData.length} Talleres insertados.`);

    // --- 2. COLECCIÓN CENTRES ---
    const colCentres = db.collection("centres");
    await colCentres.deleteMany({});

    const centresData = [
      {
        nom: "Institut Joan Brossa",
        codi_centre: "08012345",
        tipus: "Public",
        contacte: {
          nom_coordinador: "Coord. Brossa",
          email: "brossa@xtec.cat",
        },
      },
      {
        nom: "INS Milà i Fontanals",
        codi_centre: "08099999",
        tipus: "Public",
        contacte: {
          nom_coordinador: "Coord. Milà",
          email: "mila@xtec.cat",
        },
      },
    ];

    await colCentres.insertMany(centresData);
    console.log(`🏫 ${centresData.length} Centros insertados.`);

    // --- 3. COLECCIÓN PROFESORES ---
    const colProfesores = db.collection("profesores");
    await colProfesores.deleteMany({});

    const salt = await bcrypt.genSalt(10);
    const passwordHashBrossa = await bcrypt.hash("password123", salt);
    const passwordHashMila = await bcrypt.hash("password456", salt);

    const centroBrossa = await colCentres.findOne({ nom: "Institut Joan Brossa" });
    const centroMila = await colCentres.findOne({ nom: "INS Milà i Fontanals" });

    const profesoresData = [
        {
            nombre: "Profesor Brossa",
            email: "profe.brossa@example.com",
            password: passwordHashBrossa,
            centro_id: centroBrossa ? new ObjectId(centroBrossa._id) : null,
        },
        {
            nombre: "Profesor Milà",
            email: "profe.mila@example.com",
            password: passwordHashMila,
            centro_id: centroMila ? new ObjectId(centroMila._id) : null,
        },
    ];

    await colProfesores.insertMany(profesoresData);
    console.log(`${profesoresData.length} Profesores insertados.`);

    // --- 4. COLECCIÓN SOLICITUDS ---
    const colSolicituds = db.collection("solicituds");
    await colSolicituds.deleteMany({});
    console.log("Colección de Solicitudes limpiada.");

    // --- 4. COLECCIÓN ALUMNES ---
    const colAlumnes = db.collection("alumnes");
    await colAlumnes.deleteMany({});

    const alumnesData = [
      {
        nombre: 'Ana',
        apellido: 'García',
        centro: 'Institut Pedralbes',
        email: 'ana.garcia@gmail.com',
        telefono: '612 345 678',
        imagen: 'https://i.pravatar.cc/150?u=ana',
        estado: 'Aprobado',
      },
      {
        nombre: 'Carlos',
        apellido: 'López',
        centro: 'Institut Tecnològic',
        email: 'carlos.lopez@gmail.com',
        telefono: '698 765 432',
        imagen: 'https://i.pravatar.cc/150?u=carlos',
        estado: 'En proceso',
      },
      {
        nombre: 'Maria',
        apellido: 'Rodriguez',
        centro: 'Centre d\'Estudis',
        email: 'maria.rod@gmail.com',
        telefono: '655 443 322',
        imagen: 'https://i.pravatar.cc/150?u=maria',
        estado: 'Rechazado',
      },
      {
        nombre: 'Javier',
        apellido: 'Martínez',
        centro: 'Escola Pia',
        email: 'javi.martinez@gmail.com',
        telefono: '666 777 888',
        imagen: 'https://i.pravatar.cc/150?u=javier',
        estado: 'Aprobado',
      },
      {
        nombre: 'Lucía',
        apellido: 'Fernández',
        centro: 'Institut Pedralbes',
        email: 'lucia.fer@gmail.com',
        telefono: '611 222 333',
        imagen: 'https://i.pravatar.cc/150?u=lucia',
        estado: 'En proceso',
      },
      {
        nombre: 'David',
        apellido: 'Sánchez',
        centro: 'Institut Tecnològic',
        email: 'david.sanchez@gmail.com',
        telefono: '633 444 555',
        imagen: 'https://i.pravatar.cc/150?u=david',
        estado: 'Aprobado',
      },
      {
        nombre: 'Sara',
        apellido: 'Gómez',
        centro: 'Centre d\'Estudis',
        email: 'sara.gomez@gmail.com',
        telefono: '644 555 666',
        imagen: 'https://i.pravatar.cc/150?u=sara',
        estado: 'Rechazado',
      },
      {
        nombre: 'Pablo',
        apellido: 'Jiménez',
        centro: 'Escola Pia',
        email: 'pablo.jimenez@gmail.com',
        telefono: '677 888 999',
        imagen: 'https://i.pravatar.cc/150?u=pablo',
        estado: 'Aprobado',
      },
      {
        nombre: 'Laura',
        apellido: 'Ruiz',
        centro: 'Institut Pedralbes',
        email: 'laura.ruiz@gmail.com',
        telefono: '688 999 000',
        imagen: 'https://i.pravatar.cc/150?u=laura',
        estado: 'En proceso',
      },
    ];

    await colAlumnes.insertMany(alumnesData);
    console.log(`${alumnesData.length} Alumnos insertados.`);
  } catch (err) {
    console.error("❌ Error en el seed:", err);
  } finally {
    await client.close();
    console.log("👋 Conexión cerrada.");
    process.exit(0);
  }
}

seed();