"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("./lib/mongodb");
async function seedMongo() {
    try {
        const { db } = await (0, mongodb_1.connectToDatabase)();
        console.log('🌱 Iniciando MongoDB Seed...');
        // Limpiar colecciones
        await db.collection('workshop_metadata').deleteMany({});
        // 3. Col·lecció: workshop_metadata (Esquema flexible)
        await db.collection('workshop_metadata').insertMany([
            {
                id_taller: 1, // Robòtica
                tipus: 'tecnològic',
                zona: 'Eixample',
                places_totals: 100,
                places_ocupades: 45,
                requisits: {
                    software: ['Arduino IDE', 'Python 3.9'],
                    hardware: ['Kits LEGO Mindstorms', 'Sensores de ultrasonido'],
                    espai: 'Aula amb endolls cada 2 metres'
                }
            },
            {
                id_taller: 2, // Fusta
                tipus: 'artístic',
                zona: 'Sants',
                places_totals: 50,
                places_ocupades: 12,
                requisits: {
                    materials: ['Cola blanca 5kg', 'Llistons de pi 2x2'],
                    seguretat: {
                        mascaretes: true,
                        ulleres: 25
                    }
                }
            }
        ]);
        console.log('✅ MongoDB Seed completado con éxito');
    }
    catch (error) {
        console.error('❌ Error en MongoDB Seed:', error);
    }
    finally {
        await (0, mongodb_1.closeConnection)();
        process.exit(0);
    }
}
seedMongo();
