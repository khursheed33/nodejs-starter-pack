const { MongoClient } = require('mongodb');

const Config = require('../config/config.json');


const uri = Config.mongodb.uri;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const dbName = Config.mongodb.db_name;

async function initDB() {
    try {
        // Connect the client to the server
        await client.connect();
        console.log('Connected successfully to MongoDB client');
        return client.db(dbName);
    } catch (error) {
        console.error('Error connecting to MongoDB client', error);
    }
}

module.exports = initDB;
