const logAPI_URL = 'https://6ae0f23bbe3bc8fead981c0b.mockapi.io/eventLog';

// define the cancel button to just close the page and go back home.
cancelButton = document.getElementById('cancelButton');
cancelButton.addEventListener('click', (event)=>{
    event.preventDefault();
    location.replace("./index.html");
});

// Declare the Error display elements for use in the script.
const errorDisplay = document.getElementById('errorDisplay');
const errorDisplayDiv = document.getElementById('errorDisplayDiv');

// Clear any Data left in the form from the previous entry.
clearForm();

// define the submit button to create the log entry based on the data on the form.
submitButton = document.getElementById('submitButton');
submitButton.addEventListener('click', async (event) => {
    // A submit button, we don't want to submit - prevent default.
    event.preventDefault();
    // clear all errors off the form on startup
    clearErrors();

    // get datetime objects for update Details.
    /*As I've no idea when this will be run and the MockAPI service only allows limited
    entries, I've hard-coded the date to the 24th of October where I have data, and am 
    using the current time to show functionality.
    */
    const start = new Date("2026-10-24T00:00:00");
    const now = new Date(Date.now());
    now.setDate(start.getDate());
    now.setMonth(start.getMonth());
    now.setFullYear(start.getFullYear());

    // Mathc the date time format used in the API
    const timeStampTime = now.toISOString().slice(11,19);
    const timeStampDate = now.toISOString().slice(0,10);


    // Build a JSON object to represent the chosen data
    // Start with the timestamp.
    const newLogEntry = {};
    newLogEntry.Closed = ""; // Ensure MockAPI doesnt attempt to populate closed.
    newLogEntry.TimeStamp = `${timeStampDate} ${timeStampTime}`;

    // Get the Data from the entry status dropdown - validate before assigning value
    const entryStatus = document.getElementById('logEntryStatus');
    const validEntryStatus = /(Open|In progress|Closed)/;
    if (validEntryStatus.test(entryStatus.value))
        newLogEntry.Status = entryStatus.value;
    else{
        showError('please Enter a Valid Status');
        return
    }
        
    // Get the Data from the entry Type dropdown - validate before assigning value
    const entryType = document.getElementById('logEntryType');
    const validEntryType = /(Downtime|Safety|Yield|Cycletime|Output)/;
    if (validEntryType.test(entryType.value))
        newLogEntry.Type = entryType.value;
    else{
        showError('please Enter a Valid Type');
        return
    }

    // get the notes from the entry type dropdown - validate before assiging value
    const entryNotes = document.getElementById('logEntryNotes');
    const validEntryNotes = /[{}_*]+/;
    if(!validEntryNotes.test(entryNotes.value))
        newLogEntry.Notes = entryNotes.value;
    else{
        showError('please Enter a Valid Note, characters {}_ and * are not allowed');
        return
    }
    
    // If we're here, the data is correct - create a JSON String to provide to the API
    bodyData = JSON.stringify(newLogEntry);
    
    // Using the JSON object - post the new entry to the API.
    try{
        const response = await fetch(logAPI_URL,{
            method: 'POST',
            headers: {
                    'Content-Type': 'application/json'
                },
                body: bodyData
            });
        const data = await response.json();
    } catch (error) {
        console.error(`Error Posting data: ${bodyData}`);
        console.error(error);
    } finally {
        location.replace("./index.html");
    }
});
// Set the event listeners for the Dropdowns to ensure that the select option
// style is applied to the select control.
setEventListeners();

/**
 * showError
 * Convenience function to look after adding the error to the error display
 * and making the display visible 
 * @param {string} errorMessage Message to add to the error display
 */
function showError(errorMessage){
    newMessage = document.createElement('li');
    newMessage.innerText = errorMessage;
    errorDisplay.appendChild(newMessage);
    if (errorDisplayDiv.classList.contains("hidden"))
        errorDisplayDiv.classList.remove("hidden");
}

/**
 * clearErrors
 * Convenience function to clear the error display and hide it by default
 */
function clearErrors(){
    if (!errorDisplayDiv.classList.contains("hidden"))
        errorDisplayDiv.classList.add("hidden");
    errorDisplay.innerHTML = "";
}

/**
 * clearForm
 * convenience function to clear the form Data to ensure there are no 
 * entries left open since the last time the form was used. 
 */
function clearForm(){
    document.getElementById('logEntryType').value = "";
    document.getElementById('logEntryStatus').value = "Open";
    document.getElementById('logEntryNotes').innerText = "";
}

/**
 * setEventListeners
 * Populate the styled select variable for the Log Entry.
 */
function setEventListeners(){
    statusSel = document.getElementById("logEntryStatus");
    statusSel.addEventListener("change", () => {
        switch(statusSel.value){
            case 'Closed':
                statusSel.classList.remove("logStatus-inProgress");
                statusSel.classList.remove("logStatus-open");
                statusSel.classList.add("logStatus-closed");
                break;
            case 'In progress':
                statusSel.classList.remove("logStatus-open");
                statusSel.classList.remove("logStatus-closed");
                statusSel.classList.add("logStatus-inProgress");
                break;
            default:
                statusSel.classList.remove("logStatus-inProgress");
                statusSel.classList.remove("logStatus-closed");
                statusSel.classList.add("logStatus-open");
        }
    });

    typeSel = document.getElementById("logEntryType");
    typeSel.addEventListener("change", () => {
        // Remove all other classes.
        typeSel.classList.remove(
            "logType-downtime",
            "logType-safety",
            "logType-yield",
            "logType-cycletime",
            "logType-output"
        );
        typeSel.classList.add(`logType-${typeSel.value.toLowerCase()}`, `custom-select`)        
    });
    
}
