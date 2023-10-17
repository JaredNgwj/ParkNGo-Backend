const uri = 'mongodb://root:root@localhost:27017/?authSource=admin&readPreference=primary&ssl=false&directConnection=true'
const mongoClient = require('mongodb').MongoClient;
let db
module.exports.connectToDB = async() => {
    try {
        db = (await mongoClient.connect(uri)).db("db-mongodb");
        console.log("Connected to DB");
    } catch (e) {
        throw e;
    }
}

module.exports.getDB = () => {
    return db;
}