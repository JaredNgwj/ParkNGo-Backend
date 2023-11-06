const daysOfWeek = {0: 'Sunday', 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday', 6: 'Saturday'}
const promises = [];
const trends = {}

async function generateTrend() {
    const daysPerMonth = {8: 31, 9: 30}
    let date;
    let dayOfWeek;

    for (const month of Object.keys(daysPerMonth)) {
        for (let day = 1; day <= daysPerMonth[month]; day++) {
            date = new Date(`2023-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
            dayOfWeek = daysOfWeek[date.getDay()];
            twentyFourHrLoop(month, day, dayOfWeek, trends);
        }
    }
}

function twentyFourHrLoop(month, day, dayOfWeek, trends) {
    let formattedTimestamp;

    for (let hour = 0; hour < 24; hour++) {
        formattedTimestamp = `2023-${String(month-1).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:01:01`

        promises.push(getAvailabilityAndUpdateTrend(formattedTimestamp, dayOfWeek, hour, trends));
    }
}

async function getAvailabilityAndUpdateTrend(formattedTimestamp, dayOfWeek, hour, trends) {
    const resp = await fetch("https://api.data.gov.sg/v1/transport/carpark-availability?" + new URLSearchParams({
        "date_time": formattedTimestamp
    }))

    let carparkData = await resp.json();
    console.log(carparkData);
    if (Object.keys(carparkData).length === 0 || !carparkData['items'] || carparkData['items'].length === 0 || Object.keys(carparkData['items'][0]).length === 0) {
        return;
    }

    carparkData = carparkData['items'][0]['carpark_data'];
    updateTrends(trends, carparkData, dayOfWeek, hour);
}

function updateTrends(trends, carparkData, dayOfWeek, hour) {
    for (const carpark of carparkData) {
        for (const lotType of carpark['carpark_info']) {
            createNestedObject(trends, [carpark['carpark_number'], dayOfWeek, hour]);
            trends[carpark['carpark_number']][dayOfWeek][hour][lotType['lot_type']] = trends[carpark['carpark_number']][dayOfWeek][hour][lotType['lot_type']] || [];
            trends[carpark['carpark_number']][dayOfWeek][hour][lotType['lot_type']].push(lotType['lots_available']);
        }
    }
}

function createNestedObject(base, names) {    for (let i = 0; i < names.length; i++) {
    base = base[names[i]] = base[names[i]] || {};    }
}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
  }  

db.connectToDB(process.env.DB_URI_ATLAS).then(async res => {
    const mongoClient = db.getDB();
    const collection = mongoClient.collection('trendsFinal');
    const hdbTrends = await JSON.parse(fs.readFileSync('./config/trends.json'));
    const hdbIDs = Object.keys(hdbTrends);
    const maxAvail = await JSON.parse(fs.readFileSync('./config/maxAvail.json'));
    const ltaTrends = new Object();
    const wkends = ['Sunday', "Saturday"];
    const wkdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    let hasMcycles = false;
    let temp;
    let tempVal;

    const result = await collection.find({
        CarparkID: {$nin: hdbIDs}
    }).toArray();

    for (const carpark of result) {
        temp = new Object();
        hasMcycles = maxAvail[carpark.CarparkID].maxMotorcycles === null ? false : true;
        for (const day of wkends) {
            for (let i = 0; i < 24; i++) {
                console.log(i, carpark.CarparkID);
                if (carpark['Sunday'][String(i)]) {
                    tempVal = (carpark['Sunday'][String(i)]['C'][0][0] + getRandomIntInclusive(-10, 10));
                    createNestedObject(temp, [day, String(i), 'C']);
                    temp[day][String(i)]['C'] = [
                        tempVal > 0 
                        ? (tempVal <= maxAvail[carpark.CarparkID]['maxCars'] 
                            ? tempVal 
                            :  maxAvail[carpark.CarparkID]['maxCars']) 
                        : 0
                    ];

                    if (hasMcycles) {
                        tempVal = (carpark['Sunday'][String(i)]['Y'][0][0] + getRandomIntInclusive(-10, 10));
                        createNestedObject(temp, [day, String(i), 'Y']);
                        temp[day][String(i)]['C'] = [
                            tempVal > 0 
                            ? (tempVal <= maxAvail[carpark.CarparkID]['maxMotorcycles'] 
                                ? tempVal 
                                :  maxAvail[carpark.CarparkID]['maxMotorcycles']) 
                            : 0
                        ];
                    }
                } else {
                    // tempVal = (carpark['Sunday'][String(i-1)]['C'][0][0] + getRandomIntInclusive(-10, 10));
                    // createNestedObject(temp, [day, String(i), 'C']);
                    // temp[day][String(i)]['C'] = [
                    //     tempVal > 0 
                    //     ? (tempVal <= maxAvail[carpark.CarparkID]['maxCars'] 
                    //         ? tempVal 
                    //         :  maxAvail[carpark.CarparkID]['maxCars']) 
                    //     : 0
                    // ];

                    // if (hasMcycles) {
                    //     tempVal = (carpark['Sunday'][String(i-1)]['Y'][0][0] + getRandomIntInclusive(-10, 10));
                    //     createNestedObject(temp, [day, String(i), 'Y']);
                    //     temp[day][String(i)]['C'] = [
                    //         tempVal > 0 
                    //         ? (tempVal <= maxAvail[carpark.CarparkID]['maxMotorcycles'] 
                    //             ? tempVal 
                    //             :  maxAvail[carpark.CarparkID]['maxMotorcycles']) 
                    //         : 0
                    //     ];
                    // }

                    for (let j = 1; j < 24; j++) {
                        if (carpark['Sunday'][String(i-j)]) {
                            tempVal = (carpark['Sunday'][String(i-j)]['C'][0][0] + getRandomIntInclusive(-10, 10));
                            createNestedObject(temp, [day, String(i), 'C']);
                            temp[day][String(i)]['C'] = [
                                tempVal > 0 
                                ? (tempVal <= maxAvail[carpark.CarparkID]['maxCars'] 
                                    ? tempVal 
                                    :  maxAvail[carpark.CarparkID]['maxCars']) 
                                : 0
                            ];

                            if (hasMcycles) {
                                tempVal = (carpark['Sunday'][String(i-j)]['Y'][0][0] + getRandomIntInclusive(-10, 10));
                                createNestedObject(temp, [day, String(i), 'Y']);
                                temp[day][String(i)]['C'] = [
                                    tempVal > 0 
                                    ? (tempVal <= maxAvail[carpark.CarparkID]['maxMotorcycles'] 
                                        ? tempVal 
                                        :  maxAvail[carpark.CarparkID]['maxMotorcycles']) 
                                    : 0
                                ];
                            }
                            break;
                        } else if (carpark['Sunday'][String(i+j)]) {
                            tempVal = (carpark['Sunday'][String(i+j)]['C'][0][0] + getRandomIntInclusive(-10, 10));
                            createNestedObject(temp, [day, String(i), 'C']);
                            temp[day][String(i)]['C'] = [
                                tempVal > 0 
                                ? (tempVal <= maxAvail[carpark.CarparkID]['maxCars'] 
                                    ? tempVal 
                                    :  maxAvail[carpark.CarparkID]['maxCars']) 
                                : 0
                            ];

                            if (hasMcycles) {
                                tempVal = (carpark['Sunday'][String(i+j)]['Y'][0][0] + getRandomIntInclusive(-10, 10));
                                createNestedObject(temp, [day, String(i), 'Y']);
                                temp[day][String(i)]['C'] = [
                                    tempVal > 0 
                                    ? (tempVal <= maxAvail[carpark.CarparkID]['maxMotorcycles'] 
                                        ? tempVal 
                                        :  maxAvail[carpark.CarparkID]['maxMotorcycles']) 
                                    : 0
                                ];
                            }
                            break;
                        }
                    }
                }
            }
        }

        for (const day of wkdays) {
            for (let i = 0; i < 24; i++) {
                if (carpark['Tuesday'][String(i)]) {
                    tempVal = (carpark['Tuesday'][String(i)]['C'][0][0] + getRandomIntInclusive(-10, 10));
                    createNestedObject(temp, [day, String(i), 'C']);
                    temp[day][String(i)]['C'] = [
                        tempVal > 0 
                        ? (tempVal <= maxAvail[carpark.CarparkID]['maxCars'] 
                            ? tempVal 
                            :  maxAvail[carpark.CarparkID]['maxCars']) 
                        : 0
                    ];

                    if (hasMcycles) {
                        tempVal = (carpark['Tuesday'][String(i)]['Y'][0][0] + getRandomIntInclusive(-10, 10));
                        createNestedObject(temp, [day, String(i), 'Y']);
                        temp[day][String(i)]['C'] = [
                            tempVal > 0 
                            ? (tempVal <= maxAvail[carpark.CarparkID]['maxMotorcycles'] 
                                ? tempVal 
                                :  maxAvail[carpark.CarparkID]['maxMotorcycles']) 
                            : 0
                        ];
                    }
                }
            }
        }

        ltaTrends[carpark.CarparkID] = {
            ...temp
        };
    }

    fs.writeFileSync('./config/LTATrends.json', JSON.stringify(ltaTrends));
})