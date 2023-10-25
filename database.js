const mongoClient = require('mongodb').MongoClient;
const fs = require('fs')
const proj4 = require('proj4');
proj4.defs("EPSG:3414","+proj=tmerc +lat_0=1.366666666666667 +lon_0=103.8333333333333 +k=1 +x_0=28001.642 +y_0=38744.572 +ellps=WGS84 +units=m +no_defs");
let db
module.exports.connectToDB = async(uri) => {
    try {
        db = (await mongoClient.connect(uri)).db("db-mongodb");
        console.log("Connected to DB");
        await initStaticData();
        await setupDatabase();
    } catch (e) {
        throw e;
    }
}

module.exports.getDB = () => {
    return db;
}

const initStaticData = async () => {
    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdin
    });
    
    readline.question("Initialise static data?\n1: Yes\n2: No\n", async (ans) => {
        if (ans === "1") {
            const hdbCarparks = fs.readFileSync('./StaticHDBCarparks.json');
            const ltaCarparks = fs.readFileSync('./LTACarparkInfo.json');
            const carparkInfoHDB = await JSON.parse(hdbCarparks);
            const carparkInfoLTA = (await JSON.parse(ltaCarparks))['value'];
            const collection = db.collection('carparkInfo');

            for (const carpark of carparkInfoHDB) {
                const coord = proj4("EPSG:3414").inverse([carpark['x_coord'],carpark['y_coord']]);

                collection.insertOne({
                    CarparkID: carpark['car_park_no'],
                    Address: carpark['address'],
                    // Coordinates: {
                    //     Long: coord[0],
                    //     Lat: coord[1]
                    // },
                    Coordinates: {
                        "type": "Point",
                        "coordinates": [parseFloat(coords[1]), parseFloat(coords[0])]
                    },
                    CarparkType: carpark['car_park_type'],
                    ShortTermParking: carpark['short_term_parking'],
                    FreeParking: carpark['free_parking'],
                })
            }
            let coords;
            for (const carpark of carparkInfoLTA) {
                if (carpark['Agency'] !== 'HDB') {
                    coords = carpark['Location'].split(' ');
                    collection.insertOne({
                        CarparkID: carpark['CarParkID'],
                        Address: carpark['Development'],
                        // Coordinates: {
                        //     Long: coords[1],
                        //     Lat: coords[0],
                        // },
                        Coordinates: {
                            "type": "Point",
                            "coordinates": [parseFloat(coords[1]), parseFloat(coords[0])]
                        },
                        CarparkType: carpark['Agency'] + ' Carpark',
                    })
                }
            }
            console.log('DB Initialised');
        };

        readline.question("Generate trend?\n1: Yes\n2: No\n", async (ans) => {
            if (ans === '1') {
                await require('./SearchManager/searchManager').initialiseTrends();
            }
            console.log('Trends generated');
            readline.close();
        });
    });    
}

const setupDatabase = async () => {
    const collection = db.collection('carparkInfo');
    await collection.createIndex({ "Coordinates": "2dsphere" });
};