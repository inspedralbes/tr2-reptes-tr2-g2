const { getDb } = require('../config/database');
const { ObjectId } = require('mongodb');

const Taller = {
  findAll: async () => {
    const db = getDb();
    return await db.collection('tallers').find().toArray();
  },
create: async (taller) => {
    if (!taller.titol || taller.titol.trim() === '') {
        throw new Error("El campo 'titol' es obligatorio");
    }
    if (!taller.modalitat) {
        throw new Error("El campo 'modalitat' es obligatorio");
    }

    const db = getDb();
    const result = await db.collection('tallers').insertOne(taller);
    return result;
  },

  findById: async (id) => {
    const db = getDb();
    return await db.collection('tallers').findOne({ _id: new ObjectId(id) });
  },
  updateById: async (id, taller) => {
    const db = getDb();
    const result = await db.collection('tallers').updateOne(
      { _id: new ObjectId(id) },
      { $set: taller }
    );
    return result;
  },
  deleteById: async (id) => {
    const db = getDb();
    const result = await db.collection('tallers').deleteOne({ _id: new ObjectId(id) });
    return result;
  }
};

module.exports = Taller;
