const { getDb } = require('../config/database');

const Alumne = {
    findAll: async () => {
        const db = getDb();
        return await db.collection('alumnes').find().toArray();
    }
};

module.exports = Alumne;
