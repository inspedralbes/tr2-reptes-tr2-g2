const { MongoClient } = require("mongodb");

const { 
    DB_HOST, 
    MONGO_PORT, 
    MONGO_INITDB_DATABASE, 
    MONGO_INITDB_ROOT_USERNAME, 
    MONGO_INITDB_ROOT_PASSWORD 
} = process.env;

let mongoUrl;

if (DB_HOST && (DB_HOST.startsWith('mongodb://') || DB_HOST.startsWith('mongodb+srv://'))) {
    // Caso A: En el .env pusiste la URL completa
    mongoUrl = DB_HOST;
} else {
    // Caso B: Construimos la URL con las partes (IP, Puerto, etc.)
    if (MONGO_INITDB_ROOT_USERNAME && MONGO_INITDB_ROOT_PASSWORD) {
        mongoUrl = `mongodb://${MONGO_INITDB_ROOT_USERNAME}:${MONGO_INITDB_ROOT_PASSWORD}@${DB_HOST}:${MONGO_PORT}/${MONGO_INITDB_DATABASE}?authSource=admin`;
    } else {
        mongoUrl = `mongodb://${DB_HOST}:${MONGO_PORT}/${MONGO_INITDB_DATABASE}`;
    }
}

const client = new MongoClient(mongoUrl);
let dbConnection;

module.exports = {
    connectToDb: async (callback) => {
        try {
            console.log(`📡 Intentando conectar a MongoDB en: ${DB_HOST}:${MONGO_PORT}`);
            
            await client.connect();
            console.log("✅ Conexión exitosa a MongoDB");

            dbConnection = client.db(MONGO_INITDB_DATABASE || undefined); 
            
            return callback();
        } catch (error) {
            console.error("❌ Error conectando a la base de datos:", error);
            return callback(error);
        }
    },

    getDb: () => dbConnection
};