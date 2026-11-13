const logAPI_URL = 'https://6ae0f23bbe3bc8fead981c0b.mockapi.io/eventLog';

// define the cancel button to just close the page and go back home.
cancelButton = document.getElementById('cancelButton');
cancelButton.addEventListener('click', (event)=>{
    event.preventDefault();
    location.replace("./index.html");
});

const errorDisplay = document.getElementById('errorDisplay');
clearForm();
// define the submit button to create the log entry based on the data on the form.
submitButton = document.getElementById('submitButton');
submitButton.addEventListener('click', async (event) => {
    event.preventDefault();
    clearErrors();

    // get datetime objects for update Details.
    const start = new Date("2026-10-24T00:00:00");
    const now = new Date(Date.now());
    now.setDate(start.getDate());
    now.setMonth(start.getMonth());
    now.setFullYear(start.getFullYear());
    now.setMilliseconds(0);
    now.setSeconds(0);
    now.setMinutes(0);
    now.setHours(22); //<<<< For testing, Remove.


    const timeStampTime = now.toISOString().slice(11,19);
    const timeStampDate = now.toISOString().slice(0,10);


    // Build a JSON object to represent the chosen data
    const newLogEntry = {};
    newLogEntry.Closed = ""; // Ensure MockAPI doesnt attempt to populate closed.
    newLogEntry.TimeStamp = `${timeStampDate} ${timeStampTime}`;

    const entryStatus = document.getElementById('logEntryStatus');
    const validEntryStatus = /(Open|In Progress|Closed)/;
    if (validEntryStatus.test(entryStatus.value))
        newLogEntry.Status = entryStatus.value;
    else{
        showError('please Enter a Valid Status');
        return
    }
        

    const entryType = document.getElementById('logEntryType');
    const validEntryType = /(Downtime|Safety|Yield|Cycletime|Output)/;
    if (validEntryType.test(entryType.value))
        newLogEntry.Type = entryType.value;
    else{
        showError('please Enter a Valid Type');
        return
    }

    const entryNotes = document.getElementById('logEntryNotes');
    const validEntryNotes = /[{}_*]+/;
    if(!validEntryNotes.test(entryNotes.value))
        newLogEntry.Notes = entryNotes.value;
    else{
        showError('please Enter a Valid Note, characters {}_ and * are not allowed');
        return
    }
    bodyData = JSON.stringify(newLogEntry);
    
    // Using the JSON object - post the new entry to the Database.
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

function showError(errorMessage){
    newMessage = document.createElement('li');
    newMessage.innerText = errorMessage;
    errorDisplay.appendChild(newMessage);
    if (errorDisplay.classList.contains("hidden"))
        errorDisplay.classList.remove("hidden");
}

function clearErrors(){
    if (!errorDisplay.classList.contains("hidden"))
        errorDisplay.classList.add("hidden");
    errorDisplay.innerHTML = "";
}

function clearForm(){
    document.getElementById('logEntryType').value = "";
    document.getElementById('logEntryStatus').value = "Open";
    document.getElementById('logEntryNotes').innerText = "";
}