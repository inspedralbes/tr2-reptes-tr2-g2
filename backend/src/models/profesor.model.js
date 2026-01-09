const { getDb } = require('../config/database');
const { ObjectId } = require('mongodb');

const Profesor = {
  findByEmail: async (email) => {
    const db = getDb();
    return await db.collection('profesores').findOne({ email });
  },

  findById: async (id) => {
    const db = getDb();
    return await db.collection('profesores').findOne({ _id: new ObjectId(id) });
  },

  create: async (profesor) => {
    const db = getDb();
    const result = await db.collection('profesores').insertOne(profesor);
    return result;
  },
};

module.exports = Profesor;
