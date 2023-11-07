const express = require('express');
const router = express.Router();
const searchManager = require('../TrendManager/trendManager');


// Define a new route for retrieving trend data by carpark ID
router.get('/trend/:carparkID', async (req, res) => {
    try {
        const { carparkID } = req.params;
        const trendData = await searchManager.getTrendByCarparkID(carparkID);
        res.json(trendData);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;