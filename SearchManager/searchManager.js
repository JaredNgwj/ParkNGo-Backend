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

    return nearbyCarparks;          
};

// need to also return availbility data for carpark?