const express = require('express');
const router = express.Router();
const carparkManager = require('../CarparkManager/carparkManager');
/**
 *  The base URI for this interface is /carpark, so whatever endpoints we write 
 *  here will come after /carpark, eg. localhost:3000/carpark/all - to get all carparks
 */

router.get('/all', async(req, res) => {
    res.send(await carparkManager.getAllInfo());
})


module.exports = router;
