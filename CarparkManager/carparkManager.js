const db = require("../database")
const mongoClient = db.getDB();
const fs = require('fs');

const carparkInfoCollection = mongoClient.collection('carparkInfo');
const carparkTrendCollection = mongoClient.collection('carparkTrend');

module.exports.getAllInfo = async () => {
    return await carparkInfoCollection.find().toArray();
};

module.exports.initialiseTrends = async() => {
    const trends = await JSON.parse(fs.readFileSync('./trends.json'));
    
    for (const carparkId of Object.keys(trends)) {
        carparkTrendCollection.insertOne({
            CarparkID: carparkId,
            ...trends[carparkId]
        })
    }
}
