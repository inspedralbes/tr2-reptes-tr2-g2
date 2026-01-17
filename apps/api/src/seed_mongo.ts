import { connectToDatabase, closeConnection } from './lib/mongodb';

async function seedMongo() {
  try {
    const { db } = await connectToDatabase();
    
    console.log('🌱 Iniciando MongoDB Seed...');

    // Limpiar colecciones
    await db.collection('workshop_metadata').deleteMany({});
    
    // 3. Col·lecció: workshop_metadata (Esquema flexible)
    await db.collection('workshop_metadata').insertMany([
      {
        id_taller: 1, // Robòtica
        tipus: 'tecnològic',
        requisits: {
          software: ['Arduino IDE', 'Python 3.9'],
          hardware: ['Kits LEGO Mindstorms', 'Sensores de ultrasonido'],
          espai: 'Aula amb endolls cada 2 metres'
        }
      },
      {
        id_taller: 2, // Fusta
        tipus: 'artístic',
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
  } catch (error) {
    console.error('❌ Error en MongoDB Seed:', error);
  } finally {
    await closeConnection();
    process.exit(0);
  }
}

seedMongo();
