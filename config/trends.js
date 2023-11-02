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

function createNestedObject(base, names) {
    for (let i = 0; i < names.length; i++) {
        base = base[names[i]] = base[names[i]] || {};
    }
}