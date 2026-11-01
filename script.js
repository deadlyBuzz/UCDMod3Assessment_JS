console.log("Javascript is running");

const API_URL = 'https://6ae0f23bbe3bc8fead981c0b.mockapi.io/prodData';
const logAPI_URL = 'https://6ae0f23bbe3bc8fead981c0b.mockapi.io/eventLog';

const start = new Date("2026-10-24T00:00:00");
const now = new Date(Date.now());
const yesterday = new Date(start);
yesterday.setDate(yesterday.getDate() - 1);
const dayBefore = new Date(yesterday);
dayBefore.setDate(dayBefore.getDate() - 1);
console.log(`Today: ${start.toLocaleString()}`);
console.log(`yesterday: ${yesterday.toLocaleString()}`);
console.log(`Day Before: ${dayBefore.toLocaleString()}`);
console.log(`Now: ${now.toLocaleTimeString()}`);
// const today = start.toISOString().slice(0,10);
// console.log(today);
// const nowTime = start.toISOString().slice(11,19);
// console.log(nowTime);

let apiObj = {};
/** getData()
 *Get the Data from the API for both the Production Data, and the Log Data.
 */
async function getData(){
    try{
        const response = await fetch( API_URL);
        const logResponse = await fetch(logAPI_URL);
        const prodData = await response.json();
        const logData = await logResponse.json();
        // now have the API Data stored in local variables, store in a new object and return
        // prodData has data based on a fixed date.  To update this for a clean simulation, we need to change the following.
        // 2026-10-23 --> Today
        // 2026-10-22 --> Yesterday
        // 2026-10-24 --> Day before
        const retObj = {
            "prodData": prodData,
            "logData":logData
        };
        return retObj;


    } catch (error) {
        console.error("We've got this error when calling the API:")
        console.error(error);
    }
}

async function initPage(){
    apiObj = await getData();
    popChart();
}

function popChart(){
    /**
     * Populate the chart with the data from API production data.
     */
    apiObj.prodData.forEach(hourData => {
        // dateTime = hourData.timeStamp.slice(0,10);
        // hourTime = hourData.timeStamp.slice(11);
        // console.log(`dateTime: ${dateTime}`);
        // console.log(`hourTime: ${hourTime}`);

        // const hourDate = new Date(hourData);
        // console.log(`hourDate: ${hourDate.toLocaleString()}`);
        
        // Calculate the date/times for the start and end of shift.
        const shiftStart = new Date(start);
        const shiftEnd = new Date(start);
        if(8 < now.getHours() < 20){ // Day Shift
            shiftStart.setHours(8);
            shiftEnd.setHours(20);
        }
        else if( now.getHours()<8 ){ // 2nd half of night shift
            shiftEnd.setHours(8);
            shiftStart.setHours(19);
            shiftStart.setDate(shiftStart.getDate()-1);
        }
        else{ // 1st half of night shift
            shiftEnd.setHours(8);
            shiftStart.setHours(19);
            shiftEnd.setDate(shiftEnd.getDate()+1);
        }
        const thisData = apiDataToDateObj(hourData);
        if (shiftEnd.getDate() >= thisData.getDate() > shiftStart.getDate())
            console.log(thisData.toLocaleString());


    });

}

function apiDataToDateObj(dateString){
    return new Date(`${dateString.timeStamp.slice(0,10)}T${dateString.timeStamp.slice(11)}`)
    //console.log(`${dateString.timeStamp.slice(0,10)}T${dateString.timeStamp.slice(11)}`);
}

initPage();