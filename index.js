const getFormattedTimestamp = require("./timestamp");
require('dotenv').config();
const express = require('express');
const app = express();
const port = 3000;
const db = require("./database");

async function runApp() {
    app.listen(port, () => {
        console.log('Server running on http://localhost:3000/');
    })

    await db.connectToDB(process.env.DB_URI);
    
    app.get('/', (req, res) => {
        res.send('Hello world');
    })
    
    const carparkManager = require("./CarparkInterface/carparkInterface");
    
    app.use('/carpark', carparkManager);
}

runApp();
    

// (async () => {
//     console.log("TRYNA GET DATA");
//     const resp = await fetch("https://api.data.gov.sg/v1/transport/carpark-availability?" + new URLSearchParams({
//         "date_time": getFormattedTimestamp()
//     }))
//     const json = (await resp.json())['items'][0][carpark_data];
//     console.log(json);
// }) ();

// (async () => {
//     console.log("LTA")
//     const resp = await fetch("http://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2", {headers: {'AccountKey': process.env.LTA_API_KEY}})
//     const json = (await resp.json())['value'];
//     console.log(Object.keys(json).length);
// })();