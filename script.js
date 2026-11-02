console.log("Javascript is running");

const API_URL = 'https://6ae0f23bbe3bc8fead981c0b.mockapi.io/prodData';
const logAPI_URL = 'https://6ae0f23bbe3bc8fead981c0b.mockapi.io/eventLog';

const start = new Date("2026-10-24T00:00:00");
const now = new Date(Date.now());
now.setDate(start.getDate());
now.setMonth(start.getMonth());
now.setFullYear(start.getFullYear());
now.setMilliseconds(0);
now.setSeconds(0);
now.setMinutes(0);
now.setHours(22); // For testing, Remove.
const yesterday = new Date(start);
yesterday.setDate(yesterday.getDate() - 1);
const dayBefore = new Date(yesterday);
dayBefore.setDate(dayBefore.getDate() - 1);
console.log(`Today: ${start.toLocaleString()}`);
console.log(`yesterday: ${yesterday.toLocaleString()}`);
console.log(`Day Before: ${dayBefore.toLocaleString()}`);
console.log(`Now: ${now.toLocaleString()}`);
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
     * Code and Examples from: https://www.w3schools.com/js/tryit.asp?filename=tryai_chartjs_lines
     * and https://www.w3schools.com/ai/ai_chartjs.asp used for reference to build chart population.
     */
     
    const chartData = [];
    const chartLabels = [];
    const ctx = document.getElementById('myChart');
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
        if( now.getHours() >= 8 && now.getHours() < 20){ // Day Shift
            shiftStart.setHours(8);
            shiftEnd.setHours(20);
        }
        else if( now.getHours()<8 ){ // 2nd half of night shift
            shiftEnd.setHours(8);
            shiftStart.setHours(20);
            shiftStart.setDate(shiftStart.getDate()-1);
        }
        else{ // 1st half of night shift
            shiftEnd.setHours(8);
            shiftStart.setHours(20);
            shiftEnd.setDate(shiftEnd.getDate()+1);
        }
        
        //Get the hours related to the shift start and end date.
        const thisData = apiDataToDateObj(hourData);
        if ( thisData.getTime() < shiftEnd.getTime() && thisData.getTime() >= shiftStart.getTime()){
            //console.log(thisData.toLocaleString());
            chartLabels.push(thisData.toLocaleString());
            if((thisData.getTime() < now.getTime())||true) // Debug - remove when complete.
                chartData.push(hourData.output);
            else
                chartData.push(0);
        }


    });
    //console.log(chartData);
    // Data and Labels are now assembled, populate the chart
    const data = {
    labels: chartLabels,
    datasets: [
        {
        label: 'Output',
        data: chartData,
        borderColor: "rgba(255,0,0,1.0)",
        backgroundColor: "rgba(127,127,255,0.25)",
        stack: 'combined',
        type: 'bar'
        }
    ]
    };

const config = {
  type: 'line',
  data: data,
  options: {
    plugins: {
      title: {
        display: true,
        text: 'production Report'
      }
    },
    scales: {
      y: {
        stacked: true
      }
    }
  },
};

new Chart(ctx, config);

}

function apiDataToDateObj(dateString){
    return new Date(`${dateString.timeStamp.slice(0,10)}T${dateString.timeStamp.slice(11)}`)
    //console.log(`${dateString.timeStamp.slice(0,10)}T${dateString.timeStamp.slice(11)}`);
}

initPage();