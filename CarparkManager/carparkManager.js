const db = require("../database")
const mongoClient = db.getDB();

const collection = mongoClient.collection('carparkInfo');

module.exports.getAllInfo = async () => {
    return await collection.find().toArray();
};