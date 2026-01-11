const {MongoClient} = require("mongodb");

const { DB_HOST, MONGO_PORT, MONGO_INITDB_DATABASE, MONGO_INITDB_ROOT_USERNAME, MONGO_INITDB_ROOT_PASSWORD } = process.env;

let mongoUrl;

if (MONGO_INITDB_ROOT_USERNAME && MONGO_INITDB_ROOT_PASSWORD) {
  mongoUrl = `mongodb://${MONGO_INITDB_ROOT_USERNAME}:${MONGO_INITDB_ROOT_PASSWORD}@${DB_HOST}:${MONGO_PORT}/${MONGO_INITDB_DATABASE}?authSource=admin`;
} else {
  mongoUrl = `mongodb://${DB_HOST}:${MONGO_PORT}/${MONGO_INITDB_DATABASE}`;
}

// ... usar mongoUrl para conectar ...
const client = new MongoClient(mongoUrl);
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