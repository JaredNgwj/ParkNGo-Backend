const express = require('express');
const router = express.Router();
const db = require("../database")
const mongoClient = db.getDB();

const collection = mongoClient.collection('carparks')

/**
 *  The base URI for this interface is /carpark, so whatever endpoints we write 
 *  here will come after /carpark, eg. localhost:3000/carpark/all - to get all carparks
 */


router.get('/', async (req, res) => {
    collection.insertOne({'a': 1});
    res.send(await collection.find().toArray());
})


module.exports = router;
