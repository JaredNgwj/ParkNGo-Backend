const db = require("../database")
const mongoClient = db.getDB();
const fs = require('fs');
const getFormattedTimestamp = require('../timestamp');

let fetch;

// An asynchronous function to ensure fetch is imported
async function ensureFetchIsImported() {
  if (!fetch) {
    fetch = (await import('node-fetch')).default;
  }
}

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

// Function to fetch carpark availability from data.gov.sg
async function fetchCarparkDataGov() {
    await ensureFetchIsImported(); // Ensure fetch is imported before using it
    try {
        console.log("Fetching data from data.gov.sg...");
        const resp = await fetch("https://api.data.gov.sg/v1/transport/carpark-availability?" + new URLSearchParams({
            "date_time": getFormattedTimestamp()
        }));
        const json = await resp.json();
        //console.log("Full response from data.gov.sg:", json);
        //console.log("Full carpark_data array:", JSON.stringify(json.items[0].carpark_data, null, 2));
        //console.log("Single data entry from data.gov.sg:", json.items[0].carpark_data[0]); // Assuming carpark_data is an array
        return json.items[0].carpark_data; // Return the json data if needed
    } catch (error) {
        console.error("Failed to fetch data from data.gov.sg:", error);
        throw error;
    }
}

// Function to fetch carpark availability from LTA
async function fetchCarparkDataLTA() {
    await ensureFetchIsImported(); // Ensure fetch is imported before using it
    try {
        console.log("Fetching data from LTA...");
        const resp = await fetch("http://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2", {
            headers: {'AccountKey': process.env.LTA_API_KEY}
        });
        const json = await resp.json();
        //console.log("Full response from LTA:", json);
        return json; // Return the json data if needed
    } catch (error) {
        console.error("Failed to fetch data from LTA:", error);
        throw error;
    }
}

// fetchCarparkDataGov();
// fetchCarparkDataLTA();

module.exports.getAvailabilityByCarparkIDs = async (carparkIDs) => {
    // Fetch data from both Gov and LTA sources
    const carparkDataGov = await fetchCarparkDataGov();
    const carparkDataLTA = (await fetchCarparkDataLTA()).value; // Assuming that LTA data is in the 'value' key
  
    // Filter carpark data based on carparkIDs for Gov
    const filteredCarparksGov = carparkDataGov.filter(carpark =>
      carparkIDs.includes(carpark.carpark_number)
    );
  
    // Filter carpark data based on carparkIDs for LTA
    const filteredCarparksLTA = carparkDataLTA.filter(carpark =>
      carparkIDs.includes(carpark.CarParkID)
    );
  
    // Map the filtered carpark data from Gov to the desired structure
    const transformedCarparksGov = filteredCarparksGov.map(carpark => {
      const result = {
        carpark_id: carpark.carpark_number,
        car: { availability: 0, total: 0 },
        motorcycle: { availability: 0, total: 0 }
      };
  
      carpark.carpark_info.forEach(info => {
        if (info.lot_type === 'C') {
          result.car.availability = parseInt(info.lots_available, 10);
          result.car.total = parseInt(info.total_lots, 10);
        }
         if (info.lot_type === 'Y') {
          result.motorcycle.availability = parseInt(info.lots_available, 10);
          result.motorcycle.total = parseInt(info.total_lots, 10);
        }
      });
  
      return result;
    });
  
// Map the filtered carpark data from LTA to the desired structure
const transformedCarparksLTA = filteredCarparksLTA.map(carpark => {
    const result = {
        carpark_id: carpark.CarParkID,
        car: { availability: 0, total: 0 },
        motorcycle: { availability: 0, total: 0 }
    };
  
    if (carpark.LotType === 'C') {
        result.car.availability = carpark.AvailableLots;
        result.car.total = carpark.AvailableLots;
    }
    if (carpark.LotType === 'Y') {
        result.motorcycle.availability = carpark.AvailableLots;
        result.motorcycle.total = carpark.AvailableLots;
    }
    return result;
    });
  
    // Combine the transformed data from both sources
    const combinedTransformedCarparks = [...transformedCarparksGov, ...transformedCarparksLTA];
  
    // Return the combined transformed list of carpark data
    return combinedTransformedCarparks;
  }

// // Define a function to retrieve nearby car parks
// module.exports.getCarparksByLocation = async (coordinates, radius) => {
//     // Define a query to find car parks within the specified radius
//     const query = {
//         Coordinates: {
//             $nearSphere: {
//                 $geometry: {
//                     type: "Point",
//                     coordinates: [coordinates.Long, coordinates.Lat]
//                 },
//                 $maxDistance: radius // Specify the maximum distance in meters
//             }
//         }
//     };

//     // Use MongoDB's find() method with the query to retrieve nearby car parks
//     const nearbyCarparks = await carparkInfoCollection.find(query).toArray();

//     return nearbyCarparks;
// };

module.exports.getCarparksByLocation = async (coordinates, radius) => {
    try {
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

        // Extract the CarparkIDs from the nearby car parks
        const carparkIDs = nearbyCarparks.map(carpark => carpark.CarparkID);

        // Get availability data for the nearby car parks
        const availabilityData = await this.getAvailabilityByCarparkIDs(carparkIDs);

        // Combine the availability data with the carpark info
        // const combinedCarparkData = nearbyCarparks.map(carpark => {
        //     const availability = availabilityData.find(a => a.carpark_id === carpark.CarparkID);
        //     return {
        //         ...carpark, // Spread operator to include all carpark info
        //         availability: availability ? {
        //             car: availability.car,
        //             motorcycle: availability.motorcycle
        //         } : {
        //             car: { availability: -1, total: -1 }, // Use -1 to indicate unknown availability
        //             motorcycle: { availability: -1, total: -1 } // Use -1 to indicate unknown availability
        //         }
        //     };
        // });

        // Combine the availability data with the carpark info
        // and filter out entries where availability is unknown
        const combinedCarparkData = nearbyCarparks.reduce((acc, carpark) => {
            const availability = availabilityData.find(a => a.carpark_id === carpark.CarparkID);
            if (availability && (availability.car.availability >= 0 || availability.motorcycle.availability >= 0)) {
                acc.push({
                    ...carpark,
                    availability: {
                        car: availability.car,
                        motorcycle: availability.motorcycle
                    }
                });
            }
            return acc;
        }, []);

        return combinedCarparkData;
    } catch (error) {
        console.error("Error retrieving car parks by location:", error);
        throw error;
    }
};