const mongoClient = require("../database");
require('dotenv').config({path: '../.env'});
const fs = require('fs');
const proj4 = require('proj4');
const Papa = require('papaparse');
const fuzzy = require('fuzzy');
proj4.defs("EPSG:3414","+proj=tmerc +lat_0=1.366666666666667 +lon_0=103.8333333333333 +k=1 +x_0=28001.642 +y_0=38744.572 +ellps=WGS84 +units=m +no_defs");

let db;

const normalizeName = (name) => {
    return name.toLowerCase().replace(/shopping center|mall|plaza/g, '').trim();
};

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
    
    // Read and parse the CSV file for carpark rates
    const carparkRatesCSV = fs.readFileSync('./CarparkRates.csv', 'utf8');
    const carparkRates = Papa.parse(carparkRatesCSV, { header: true, skipEmptyLines: true }).data;

    // Create a map for carpark rates using Carpark ID
    const carparkRatesMap = {};
    carparkRates.forEach(rate => {
        let normalizedCarparkName = normalizeName(rate.carpark);
        carparkRatesMap[normalizedCarparkName] = {
            weekdayRate1: rate['weekdays_rate_1'], // Adjust as per your CSV column names
            weekdayRate2: rate['weekdays_rate_2'], // Adjust as per your CSV column names
            saturdayRate: rate['saturday_rate'], // Adjust as per your CSV column names
            sundayPublicHolidayRate: rate['sunday_publicholiday_rate'] // Adjust as per your CSV column names
        };
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
                
                const rates = carparkRatesMap[carpark['car_park_no']] || {
                    weekdayRate1: 'THIS IS HDB PRICES',
                    weekdayRate2: 'THIS IS HDB PRICES',
                    saturdayRate: 'THIS IS HDB PRICES',
                    sundayPublicHolidayRate: 'THIS IS HDB PRICES'
                };

                await collection.insertOne({
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
                    Prices: rates
                })
            }
            const seen = new Set();
            let rates;
            for (const carpark of carparkInfoLTA) {
                if (carpark['Agency'] !== 'HDB' && !seen.has(carpark['CarParkID'])) {
                    seen.add(carpark['CarParkID']);
                    coords = carpark['Location'].split(' ');
                    let normalizedDevelopmentName = normalizeName(carpark['Development']);
                    let matches = fuzzy.filter(normalizedDevelopmentName, Object.keys(carparkRatesMap));
                    let match = matches.length > 0 ? matches[0].string : null;
                    if (match) {
                        // Retrieve rates using the best fuzzy match
                        rates = carparkRatesMap[match] || {
                            weekdayRate1: 'Not Available',
                            weekdayRate2: 'Not Available',
                            saturdayRate: 'Not Available',
                            sundayPublicHolidayRate: 'Not Available'
                        };
                    }
                    else {
                        rates = carparkRatesMap[carpark['Development']] || {
                            weekdayRate1: 'Not Available',
                            weekdayRate2: 'Not Available',
                            saturdayRate: 'Not Available',
                            sundayPublicHolidayRate: 'Not Available'
                        };
                    }
                    await collection.insertOne({
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
                        Prices: rates
                    })
                }
            }
            console.log('DB Initialised - rates included');
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