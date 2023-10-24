const db = require("../database")
const mongoClient = db.getDB();
const fs = require('fs');

const carparkInfoCollection = mongoClient.collection('carparkInfo');
const carparkTrendCollection = mongoClient.collection('carparkTrend');

//logic to do the function (FINDWHERE ID = XYZ FOR TREND)

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

// Define a function to retrieve nearby car parks
module.exports.getCarparksByLocation = async (coordinates, radius) => {
    // Define a query to find car parks within the specified radius
    const query = {
        Coordinates: {
            $nearSphere: {
                $geometry: {
                    type: "Point",
                    coordinates: [coordinates.Long, coordinates.Lat]
                },
                $maxDistance: radius // Specify the maximum distance in meters
            }
        }
    };

    // Use MongoDB's find() method with the query to retrieve nearby car parks
    const nearbyCarparks = await carparkInfoCollection.find(query).toArray();

    return nearbyCarparks;          // shouldn't this also return availbility data for carpark?
};

// DID all this, unsure if we want to keep this though:
// 1- need to handle error for invalid query parameters
// 2- Validate if the parsed longitude, latitude, and radius values are within a reasonable or expected range?
// For instance, latitude should be between -90 and 90, and longitude should be between -180 and 180.
// 3- If the radius is not provided, have a default value? Return Error?
// 4- make geospatial query efficient by ensuring that there is an index on the Coordinates field in the MongoDB collection
// 4- carparkInfoCollection.createIndex({ "Coordinates": "2dsphere" });
// IMPT: will do 4 if it takes too long when testing

// need to add:

/*
// This is usually placed where you are setting up your database connection or collection
const setupDatabase = async () => {
    // Assuming carparkInfoCollection is already connected/initialized here
    await carparkInfoCollection.createIndex({ "Coordinates": "2dsphere" });
};
*/