// Definimos los roles exactos que espera la Base de Datos
export const ROLES = {
  ADMIN: 'ADMIN',
  COORDINADOR: 'COORDINADOR',
  PROFESOR: 'PROFESSOR' // Fíjate que en BD es 'PROFESSOR' (con doble S), fácil de equivocarse
} as const;

export type Rol = typeof ROLES[keyof typeof ROLES];

// Definimos los estados de las peticiones
export const ESTADOS_PETICION = {
  PENDIENTE: 'PENDENT',
  ACEPTADA: 'ACCEPTADA',
  RECHAZADA: 'REBUTJADA' // 'REBUTJADA' es difícil de escribir bien siempre
} as const;

export type EstadoPeticion = typeof ESTADOS_PETICION[keyof typeof ESTADOS_PETICION];

export const esEmailValido = (email: string): boolean => {
  return !!String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};
