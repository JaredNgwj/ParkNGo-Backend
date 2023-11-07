const db = require("../database")
const mongoClient = db.getDB();

const carparkTrendCollection = mongoClient.collection('carparkTrend');

module.exports.getTrendByCarparkID = async (carparkID) => {
    try {
        const trendData = await carparkTrendCollection.findOne({ CarparkID: carparkID });

        if (!trendData) {
            throw new Error('No trend data available for the specified carpark ID');
        }
        const { _id, CarparkID, ...trends } = trendData;

        const medianAvailability = {};
        for (const day in trends) {
            medianAvailability[day] = {};
            for (const hour in trends[day]) {
                const dataArray = trends[day][hour].C;
                dataArray.sort((a, b) => a - b);
                const len = dataArray.length;
                const median = len % 2 === 0 ?
                    (parseFloat(dataArray[len / 2 - 1]) + parseFloat(dataArray[len / 2])) / 2 :
                    parseFloat(dataArray[(len - 1) / 2]);
                medianAvailability[day][hour] = Math.round(median);
            }
        }

        return medianAvailability;
    } catch (error) {
        console.error(error);
        throw new Error('Failed to fetch trend data');
    }
};
