const {MongoClient} = require("mongodb");
const path = require("path");

require("dotenv").config({ path: path.resolve(__dirname, ".env.dev") });

const uri = `mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME}:${process.env.MONGO_INITDB_ROOT_PASSWORD}@localhost:${process.env.MONGO_PORT}/?authSource=admin`;

const client = new MongoClient(uri);
let dbConnection;

//Cambios leves en la ortografia
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