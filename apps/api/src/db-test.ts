import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

async function test() {
    const prisma = new PrismaClient();
    try {
        console.log('--- Testing DB Connection ---');
        await prisma.$queryRaw`SELECT 1`;
        console.log('DB Connection: OK');

        console.log('--- Testing User Retrieval ---');
        const user = await prisma.usuari.findUnique({
            where: { email: 'admin@admin.com' },
            include: { rol: true, centre: true }
        });

        if (user) {
            console.log('User found:', {
                id: user.id_usuari,
                email: user.email,
                role: user.rol.nom_rol,
                centre: user.centre ? user.centre.nom : 'None'
            });

            console.log('--- Testing Password Comparison ---');
            const valid = await bcrypt.compare('Iter@1234', user.password_hash);
            console.log('Password valid:', valid);
        } else {
            console.log('User NOT found: admin@admin.com');
        }

    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

test();
