// Definimos los roles exactos que espera la Base de Datos
const ROLES = {
  ADMIN: 'ADMIN',
  COORDINADOR: 'COORDINADOR',
  PROFESOR: 'PROFESSOR' // Fíjate que en BD es 'PROFESSOR' (con doble S), fácil de equivocarse
};

// Definimos los estados de las peticiones
const ESTADOS_PETICION = {
  PENDIENTE: 'PENDENT',
  ACEPTADA: 'ACCEPTADA',
  RECHAZADA: 'REBUTJADA' // 'REBUTJADA' es difícil de escribir bien siempre
};

const esEmailValido = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

module.exports = {
  ROLES,
  ESTADOS_PETICION,
  esEmailValido
};