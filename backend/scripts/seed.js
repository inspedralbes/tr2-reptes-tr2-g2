const { MongoClient } = require("mongodb");
const path = require("path");

require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const uri = `mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME}:${process.env.MONGO_INITDB_ROOT_PASSWORD}@${process.env.DB_HOST}:${process.env.MONGO_PORT}/?authSource=admin`;
const client = new MongoClient(uri);

async function seed() {
  try {
    console.log("🌱 %% Iniciando proceso de Seed...");
    await client.connect();
    const db = client.db(process.env.MONGO_INITDB_DATABASE);

    // --- 1. COLECCIÓN TALLERS ---
    const colTallers = db.collection("tallers");
    await colTallers.deleteMany({});

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
    console.log(`${tallersData.length} Talleres insertados.`);

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
    console.log(`${centresData.length} Centros insertados.`);

    // --- 3. COLECCIÓN SOLICITUDS ---
    const colSolicituds = db.collection("solicituds");
    await colSolicituds.deleteMany({});
    console.log("Colección de Solicitudes limpiada.");
  } catch (err) {
    console.error("Error en el seed:", err);
  } finally {
    await client.close();
    console.log("Conexión cerrada.");
    process.exit(0);
  }
}

seed();
