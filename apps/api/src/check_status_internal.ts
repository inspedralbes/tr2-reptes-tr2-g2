
import { PrismaClient } from '@prisma/client';
import { MongoClient } from 'mongodb';

async function checkStatus() {
    console.log('Starting DB status check...');
    console.log('MONGODB_URI suffix:', process.env.MONGODB_URI?.slice(-20));

    const prisma = new PrismaClient();
    const mongoClient = new MongoClient(process.env.MONGODB_URI || '');

    try {
        console.log('Connecting to PostgreSQL...');
        const sqlPeticions = await prisma.peticio.findMany({
            select: { id_peticio: true, estat: true }
        });
        console.log('✅ PostgreSQL Connected. Petitions count:', sqlPeticions.length);
        console.table(sqlPeticions);

        console.log('Connecting to MongoDB...');
        await mongoClient.connect();
        console.log('✅ MongoDB Connected.');
        const db = mongoClient.db(process.env.MONGODB_DB_NAME);
        const mongoChecklists = await db.collection('request_checklists').find({}).project({ id_peticio: 1, status: 1, _id: 0 }).toArray();
        console.log('MongoDB Checklists count:', mongoChecklists.length);
        console.table(mongoChecklists);

    } catch (err: any) {
        console.error('❌ Error during check:', err.message);
        if (err.stack) console.error(err.stack);
    } finally {
        await prisma.$disconnect();
        await mongoClient.close();
    }
}

checkStatus();
