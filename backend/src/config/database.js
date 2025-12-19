const {MongoClient} = require("mongodb");

const uri = `mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME}:${process.env.MONGO_INITDB_ROOT_PASSWORD}@${process.env.DB_HOST}:${process.env.MONGO_PORT}/?authSource=admin`;

const client = new MongoClient(uri);
let dbConnection;

module.exports = {
    connectToDb: async (callback) => {
        try {
            await client.connect();
            console.log("Conexión exitosa a MongoDB");

            dbConnection = client.db(process.env.MONGO_INITDB_DATABASE); // Para seleccionar la db
            return callback();
        } catch (error) {
            console.error("Error conectando a la base de datos:", error);
            return callback(error);
        }
    },

    getDb: () => dbConnection
}