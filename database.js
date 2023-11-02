const mongoClient = require('mongodb').MongoClient;
let db

module.exports.connectToDB = async(uri) => {
    try {
        db = (await mongoClient.connect(uri)).db("db-mongodb");
        console.log("Connected to DB");
        await setupDatabase();
    } catch (e) {
        throw e;
    }
}

module.exports.getDB = () => {
    return db;
}

const setupDatabase = async () => {
    const collection = db.collection('carparkInfo');
    await collection.createIndex({ "Coordinates": "2dsphere" });
};