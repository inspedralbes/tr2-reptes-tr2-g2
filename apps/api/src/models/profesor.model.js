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

  findAll: async () => {
    const db = getDb();
    return await db.collection('profesores').find().toArray();
  },

  create: async (profesor) => {
    const db = getDb();
    const result = await db.collection('profesores').insertOne(profesor);
    return result;
  },

  updateById: async (id, profesor) => {
    const db = getDb();
    const result = await db.collection('profesores').updateOne(
      { _id: new ObjectId(id) },
      { $set: profesor }
    );
    return result;
  },

  deleteById: async (id) => {
    const db = getDb();
    const result = await db.collection('profesores').deleteOne({ _id: new ObjectId(id) });
    return result;
  }
};

module.exports = Profesor;
