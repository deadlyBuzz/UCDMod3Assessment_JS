console.log("Javascript is running");

const API_URL = 'https://6ae0f23bbe3bc8fead981c0b.mockapi.io/prodData';
const logAPI_URL = 'https://6ae0f23bbe3bc8fead981c0b.mockapi.io/eventLog';
const usersAPI_URL = 'https://6ae0f23bbe3bc8fead981c0b.mockapi.io/Users';

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
        const userResponse = await fetch(usersAPI_URL);
        const userData = await userResponse.json();
        // now have the API Data stored in local variables, store in a new object and return
        // prodData has data based on a fixed date.  To update this for a clean simulation, we need to change the following.
        // 2026-10-23 --> Today
        // 2026-10-22 --> Yesterday
        // 2026-10-24 --> Day before
        const retObj = {
            "prodData": prodData,
            "logData":logData,
            "userData": userData
        };
        return retObj;


    } catch (error) {
        console.error("We've got this error when calling the API:")
        console.error(error);
    }
}

/**
 * initPage
 * An Asynchronous function to call the functions required to initialise the page
 * while waiting for responses from external resources. 
 */
async function initPage(){
    apiObj = await getData();
    popChart();
    popLog();
}

/**
 * Populate the chart with the data from API production data.
 * Code and Examples from: https://www.w3schools.com/js/tryit.asp?filename=tryai_chartjs_lines
 * and https://www.w3schools.com/ai/ai_chartjs.asp used for reference to build chart population.
 * <<<< TODO: Add ref for Google
 */
function popChart(){
     
    const chartData = [];
    const chartLabels = [];
    const ctx = document.getElementById('myChart');

    apiObj.prodData.forEach(hourData => {
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
            chartLabels.push(thisData.toLocaleString());
            if((thisData.getTime() < now.getTime())||true) // Todo: Debug - remove when complete.<<<<
                chartData.push(hourData.output);
            else
                chartData.push(0);
        }


    });

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

/**
 * Get Log Status
 * Pass the log entry object (Line from array retrieved from API) and
 * return the Element to place in the log display for the status field.
 */
function getLogStatus(logEntry){
    selectVar = document.createElement("select");
    selectVar.setAttribute("name", `logStatus${logEntry.id}`);
    selectVar.setAttribute("id", `logStatus${logEntry.id}`);
    selectVar.classList.add("custom-select");

    openOpt = document.createElement("option");
    openOpt.setAttribute("value","Open");
    openSpan = document.createElement("span");
    openSpan.innerText = "Open";
    openSpan.classList.add("logStatus-open");
    openOpt.appendChild(openSpan);
    

    inprogOpt = document.createElement("option");
    inprogOpt.setAttribute("value","In progress");
    inprogSpan = document.createElement("span");
    inprogSpan.innerText = "In progress";
    inprogSpan.classList.add("logStatus-inProgress");
    inprogOpt.appendChild(inprogSpan);

    closedOpt = document.createElement("option");
    closedOpt.setAttribute("value","Closed");
    closedSpan = document.createElement("span");
    closedSpan.innerText = "Closed";
    closedSpan.classList.add("logStatus-closed");
    closedOpt.appendChild(closedSpan);


    switch(logEntry.Status){
        case 'In progress':
            selectVar.classList.add("logStatus-inProgress");
            inprogOpt.setAttribute("selected", true);
            break;
        case 'Closed':
            selectVar.classList.add("logStatus-closed");
            closedOpt.setAttribute("selected", true);
            break;
        default:
            selectVar.classList.add("logStatus-open");
            openOpt.setAttribute("selected", true);            
    }

    selectVar.appendChild(openOpt);
    selectVar.appendChild(inprogOpt);
    selectVar.appendChild(closedOpt);

    // Add the event listener to update the button on data change and allow saving.
    selectVar.addEventListener("change", () => {
        thisSelect = document.getElementById(`logStatus${logEntry.id}`);
        thisUpdateButton = document.getElementById(`updateButton${logEntry.id}`);
        thisCancelButton = document.getElementById(`cancelButton${logEntry.id}`);

        switch(thisSelect.value){
            case 'Closed':
                thisSelect.classList.remove("logStatus-inProgress");
                thisSelect.classList.remove("logStatus-open");
                thisSelect.classList.add("logStatus-closed");
                break;
            case 'In progress':
                thisSelect.classList.remove("logStatus-open");
                thisSelect.classList.remove("logStatus-closed");
                thisSelect.classList.add("logStatus-inProgress");
                break;
            default:
                thisSelect.classList.remove("logStatus-inProgress");
                thisSelect.classList.remove("logStatus-closed");
                thisSelect.classList.add("logStatus-open");
        }

        thisUpdateButton.classList.remove("hidden");
        thisCancelButton.classList.remove("hidden");
    });

    return selectVar;
}

function getLogNotes(logEntry){
    console.log('LogEntry: ',logEntry);
    thisUpdateButton = document.getElementById(`updateButton${logEntry.id}`);
    thisCancelButton = document.getElementById(`cancelButton${logEntry.id}`);
    const noteInput = document.createElement('input');
    noteInput.setAttribute('type', 'text');
    noteInput.setAttribute('id',"inputField"+logEntry.id);
    noteInput.value = logEntry.Notes
    noteInput.addEventListener("change", () => {
        thisUpdateButton = document.getElementById(`updateButton${logEntry.id}`);
        thisCancelButton = document.getElementById(`cancelButton${logEntry.id}`);
        thisUpdateButton.classList.remove("hidden");
        thisCancelButton.classList.remove("hidden");
    });
    return noteInput;
}

/**
 * Get Log Type
 * Pass the log entry object (Line from array retrieved from API) and
 * return the Element to place in the log display for tye type field.
 */
function getLogType(logEntry){

}


/**
 * Populate Log.
 * Get the data from the log retrieved from the API and populate it on the Page
 */
function popLog(){
    logDisplay = document.getElementById('div_logDisplay');

    // Iterate through each logEntry and create a line on the event log.
    apiObj.logData.forEach(logEntry => {
        const entryDiv = document.createElement("div");
        entryDiv.classList.add("logEntry");
        
        const timeSpan = document.createElement("span");
        timeSpan.classList.add("logType");
        timeSpan.innerText = logEntry.TimeStamp;
        entryDiv.appendChild(timeSpan);

        const typeSpan = document.createElement("span");
        typeSpan.innerText = logEntry.Type;
        typeSpan.classList.add("logType");
        switch(logEntry.Type){
            case('Downtime'):
                typeSpan.classList.add("logType-downtime");
                break;
            case('Safety'):
                typeSpan.classList.add("logType-safety");
                break;
            default:
                typeSpan.classList.add("logType-output");
                break;
        }
        entryDiv.appendChild(typeSpan);

        const statusSpan = document.createElement("span");
        statusSpan.classList.add("logType");
        statusSpan.appendChild(getLogStatus(logEntry));
        entryDiv.appendChild(statusSpan);

        const noteSpan = document.createElement("span");
        noteSpan.appendChild(getLogNotes(logEntry));
        entryDiv.appendChild(noteSpan);

        const ownerSpan = document.createElement("span");
        ownerSpan.classList.add("logType");
        ownerSpan.innerText = logEntry.Owner;
        entryDiv.appendChild(ownerSpan);

        // Add controls section where the Update and cancel buttons are shown.
        const controlsSpan = document.createElement("span");
        const updateButton = document.createElement("button");
        //if(logEntry.Status === "Closed") updateButton.classList.add("hidden");
        updateButton.classList.add("hidden");
        updateButton.setAttribute('data-logentry',logEntry.id);
        updateButton.setAttribute('id',`updateButton${logEntry.id}`);
        updateButton.textContent = 'Update';
        updateButton.addEventListener("click", async () =>{
            const thisLogEntry = apiObj.logData.filter((entry) => entry.id===logEntry.id)[0];
            const logNotes = document.getElementById(`inputField${thisLogEntry.id}`).value;            
            const logStatus = document.getElementById(`logStatus${thisLogEntry.id}`).value;
            const thisUpdateButton = document.getElementById(`updateButton${thisLogEntry.id}`);
            const thisCancelButton = document.getElementById(`cancelButton${thisLogEntry.id}`);
            thisLogEntry.Notes = logNotes;
            thisLogEntry.Status = logStatus;
            console.log("thisLogEntry: ", thisLogEntry);
            const bodyData = JSON.stringify(thisLogEntry);
            console.log('Body Data', bodyData);
            try{
            const response = await fetch(`${logAPI_URL}/${logEntry.id}`,{
                method: 'PUT',
                headers: {
                        'Content-Type': 'application/json'
                    },
                    body: bodyData
                });
            const data = await response.json();
            console.log("Data Updated:",data);
            thisUpdateButton.classList.add("hidden");
            thisCancelButton.classList.add("hidden");
            } catch (error) {
                console.error("Error Updating the Log:");
                console.error(error);   
            }
        }); 

        const cancelButton = document.createElement("button");
        cancelButton.classList.add("hidden");
        cancelButton.setAttribute('data-logentry',logEntry.id);
        cancelButton.setAttribute('id',`cancelButton${logEntry.id}`);
        cancelButton.textContent = 'Cancel';
        // TODO: Add Event Listeners for Buttons
        controlsSpan.classList.add("logType");
        controlsSpan.appendChild(updateButton);
        controlsSpan.appendChild(cancelButton);
        entryDiv.appendChild(controlsSpan);

        logDisplay.appendChild(entryDiv);
    });
    newButton = document.createElement("button");
    newButton.innerText = "New log Entry";
    newButton.addEventListener("click", (event) =>{
        event.preventDefault();
        location.replace("./newlogentry.html");
    });
    logDisplay.appendChild(newButton);
}

initPage();