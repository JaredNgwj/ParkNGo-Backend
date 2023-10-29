const express = require('express');
const router = express.Router();
const searchManager = require('../SearchManager/searchManager');
/**
 *  The base URI for this interface is /carpark, so whatever endpoints we write 
 *  here will come after /carpark, eg. localhost:3000/carpark/all - to get all carparks
 */

router.get('/all', async(req, res) => {
    res.send(await searchManager.getAllInfo());
})

// Define a new route for retrieving nearby car parks
router.get('/nearby', async (req, res) => {
    try {
        // Get the coordinates and radius from the request query parameters
        const { longitude, latitude, radius } = req.query;

        // Validate the parameters
        if (!longitude || !latitude || !radius) {
            return res.status(400).json({ error: "Longitude, latitude, and radius are required." });
        }

        const long = parseFloat(longitude);
        const lat = parseFloat(latitude);
        const rad = parseFloat(radius);

        // Validate the parsed values
        if (isNaN(long) || isNaN(lat) || isNaN(rad) || lat < -90 || lat > 90 || long < -180 || long > 180) {
            return res.status(400).json({ error: "Invalid longitude, latitude, or radius values." });
        }

        const coordinates = {
            Long: long,
            Lat: lat
        };

        // Call the getCarparksByLocation function to retrieve nearby car parks
        const nearbyCarparks = await searchManager.getCarparksByLocation(coordinates, rad);

        // Send the nearby car parks as the response
        res.json(nearbyCarparks);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

//create endpoint for fn
//carparkManager.getAllnearbycarpacrks... and same for gettrendbycarparkid

const searchManager = require('../SearchManager/searchManager');

// Define a new route for retrieving trend data by carpark ID
router.get('/trend/:carparkID', async (req, res) => {
    try {
        // Get the carpark ID from the request parameters
        const { carparkID } = req.params;

        // Call the getTrendByCarparkID function to retrieve trend data
        const trendData = await searchManager.getTrendByCarparkID(carparkID);

        // Send the trend data as the response
        res.json(trendData);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;


