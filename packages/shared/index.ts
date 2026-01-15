// Definimos los roles exactos que espera la Base de Datos
export const ROLES = {
  ADMIN: 'ADMIN',
  COORDINADOR: 'COORDINADOR',
  PROFESOR: 'PROFESSOR' // Fíjate que en BD es 'PROFESSOR' (con doble S), fácil de equivocarse
} as const;

export type Rol = typeof ROLES[keyof typeof ROLES];

// Definimos los estados de las peticiones - Alineados con Prisma Enum 'EstatPeticio'
export const ESTADOS_PETICION = {
  PENDIENTE: 'Pendent',
  ACEPTADA: 'Aprovada',
  RECHAZADA: 'Rebutjada'
} as const;

export type EstadoPeticion = typeof ESTADOS_PETICION[keyof typeof ESTADOS_PETICION];

export const esEmailValido = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};