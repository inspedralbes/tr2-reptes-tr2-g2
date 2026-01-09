const { getDb } = require('../config/database');
const { ObjectId } = require('mongodb');

const Centro = {
  findAll: async () => {
    const db = getDb();
    return await db.collection('centros').find().toArray();
  },

  findById: async (id) => {
    const db = getDb();
    return await db.collection('centros').findOne({ _id: new ObjectId(id) });
  },

  findByName: async (name) => {
    const db = getDb();
    return await db.collection('centros').findOne({ nom: name });
  },

  create: async (centro) => {
    const db = getDb();
    const result = await db.collection('centros').insertOne(centro);
    return result;
  },
};

module.exports = Centro;
