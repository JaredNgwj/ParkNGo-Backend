async function runApp() {
    const express = require('express');
    const app = express();
    const port = 3000;
    const db = require("./database")
    await db.connectToDB();

    app.get('/', (req, res) => {
        res.send('Hello world');
    })
    
    const carparkManager = require("./CarparkInterface/carparkInterface");

    app.use('/carpark', carparkManager);
    app.listen(port, () => {
        console.log('Server running on http://localhost:3000/');
    })

}

runApp();