console.log("javascript is running");
const logAPI_URL = 'https://6ae0f23bbe3bc8fead981c0b.mockapi.io/eventLog';

cancelButton = document.getElementById('cancelButton');
cancelButton.addEventListener('click', (event)=>{
    event.preventDefault();
    location.replace("./index.html");
});
submitButton = document.getElementById('submitButton');
submitButton.addEventListener('click', async (event) => {
    event.preventDefault();

    // get datetime objects for update Details.
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

    const timeStampTime = now.toISOString().slice(11,19);
    const timeStampDate = now.toISOString().slice(0,10);
    const newLogEntry = {};
    newLogEntry.TimeStamp = `${timeStampDate} ${timeStampTime}`;

    const entryStatus = document.getElementById('logEntryStatus');
    newLogEntry.Status = entryStatus.value;

    const entryType = document.getElementById('logEntryType');
    newLogEntry.Type = entryType.value;

    const entryNotes = document.getElementById('logEntryNotes');
    newLogEntry.Notes = entryNotes.value;
    bodyData = JSON.stringify(newLogEntry);

    //console.log(bodyData);
    //return;
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