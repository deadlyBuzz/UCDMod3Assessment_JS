console.log("Javascript is running");

const API_URL = 'https://retoolapi.dev/g7RkpX/proddata';
const logAPI_URL = 'https://6ae0f23bbe3bc8fead981c0b.mockapi.io/eventLog';

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
}

initPage();