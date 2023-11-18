const express = require('express');
const router = express.Router();
const searchManager = require('../SearchManager/searchManager');
/**
 *  The base URI for this interface is /carpark, so whatever endpoints we write 
 *  here will come after /carpark, eg. localhost:3000/carpark/all - to get all carparks
 */

router.get('/all', async(req, res) => {
    try {
        res.send(await searchManager.getAllInfo());
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
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
        if (isNaN(long) || isNaN(lat) || isNaN(rad) || lat < -90 || lat > 90 || long < -180 || long > 180 || rad <= 0) {
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

router.get('/availability', async (req, res) => {
    try {
        const { carparkIds } = req.query;
        
        const result = await searchManager.getCarparkInfoByIds(JSON.parse(carparkIds));

        res.json(result);
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})

module.exports = router;


