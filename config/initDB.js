const mongoClient = require("../database");
require('dotenv').config({path: '../.env'});
let db;
const fs = require('fs');
const proj4 = require('proj4');
proj4.defs("EPSG:3414","+proj=tmerc +lat_0=1.366666666666667 +lon_0=103.8333333333333 +k=1 +x_0=28001.642 +y_0=38744.572 +ellps=WGS84 +units=m +no_defs");

const initAvailability = async () => {
    const avail = await JSON.parse(fs.readFileSync("./maxAvail.json"));
    const collection = db.collection('maxAvail');
    await collection.createIndex({"CarparkID": 'text'});
    for (const key of Object.keys(avail)) {
        await collection.insertOne({
            CarparkID: key,
            maxCars: avail[key]['maxCars'],
            maxMotorcycles: avail[key]['maxMotorcycles']
        })
    }
    console.log('Done');
}

const initStaticData = async () => {
    await mongoClient.connectToDB(process.env.DB_URI);
    db = mongoClient.getDB();
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
            await collection.createIndex({'CarparkID': 'text'});

            let coords;
            for (const carpark of carparkInfoHDB) {
                coords = proj4("EPSG:3414").inverse([carpark['x_coord'],carpark['y_coord']]);

                collection.insertOne({
                    CarparkID: carpark['car_park_no'],
                    Address: carpark['address'],
                    // Coordinates: {
                    //     Long: coord[0],
                    //     Lat: coord[1]
                    // },
                    Coordinates: {
                        "type": "Point",
                        "coordinates": [parseFloat(coords[0]), parseFloat(coords[1])]
                    },
                    CarparkType: carpark['car_park_type'],
                    ShortTermParking: carpark['short_term_parking'],
                    FreeParking: carpark['free_parking'],
                })
            }
            const seen = new Set();
            for (const carpark of carparkInfoLTA) {
                if (carpark['Agency'] !== 'HDB' && !seen.has(carpark['CarParkID'])) {
                    seen.add(carpark['CarParkID']);
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
                await require('../SearchManager/searchManager').initialiseTrends();
            }
            console.log('Trends generated');
            
            readline.question('Generate max availability data?\n1: Yes\n2: No\n', async (ans) => {
                if (ans === '1') {
                    await initAvailability();
                } else {
                    console.log("Init done, you can close the process with ctrl + c now")
                }
                readline.close();
            })
        });
    });    
}

initStaticData();