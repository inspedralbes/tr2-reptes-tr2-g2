"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.closeConnection = exports.connectToDatabase = void 0;
const mongodb_1 = require("mongodb");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const uri = process.env.MONGODB_URI || '';
const dbName = process.env.MONGODB_DB_NAME || 'iter_db';
if (!uri || uri.includes('<db_password>')) {
    console.warn('⚠️ MONGODB_URI no configurada: Debes poner tu contraseña en apps/api/.env');
}
let client = null;
let db = null;
exports.db = db;
async function connectToDatabase() {
    if (client && db) {
        return { client, db };
    }
    try {
        // Configuración recomendada para MongoDB Atlas Stable API
        client = new mongodb_1.MongoClient(uri, {
            serverApi: {
                version: mongodb_1.ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
            }
        });
        await client.connect();
        exports.db = db = client.db(dbName);
        console.log('✅ Conectado a MongoDB Atlas (Stable API v1)');
        return { client, db };
    }
    catch (error) {
        console.error('❌ Error conectando a MongoDB Atlas:', error);
        throw error;
    }
}
exports.connectToDatabase = connectToDatabase;
async function closeConnection() {
    if (client) {
        await client.close();
        client = null;
        exports.db = db = null;
        console.log('🔌 Conexión a MongoDB cerrada');
    }
}
exports.closeConnection = closeConnection;
