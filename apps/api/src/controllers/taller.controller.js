import prisma from '../lib/prisma'; // Importas el cliente

export const getTallers = async (req, res) => {
  const tallers = await prisma.taller.findMany({
    include: {
      sector: true // El "populate" de Prisma
    }
  });
  res.json(tallers);
};