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

//create endpoint for fn
//carparkManager.getAllnearbycarpacrks... and same for gettrendbycarparkid

module.exports = router;