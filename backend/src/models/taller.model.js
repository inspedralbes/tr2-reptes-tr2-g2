const { getDb } = require('../config/database');

const Taller = {
  findAll: async () => {
    const db = getDb();
    return await db.collection('tallers').find().toArray();
  }
};

module.exports = Taller;
