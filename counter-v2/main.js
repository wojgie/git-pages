let langPacks = {}
let counters = []

langPacks["en"] = JSON.parse("{\"counter.countTo\":\"counting to\",\"counter.weeks\":\"weeks\",\"counter.days\":\"days\",\"counter.hours\":\"hours\",\"counter.minutes\":\"minutes\",\"counter.seconds\":\"seconds\",\"counter.percentage\":\"percentage\",\"counter.wWeekends\":\"without weekends (days)\",\"html.header\":\"Counter\",\"counter.finished\":\"Counting finished\",\"counter.finishedVacations\":\"Counting finished! see you in September\",\"html.title\":\"Counter\"}")

let lang = "en"
let profile = "main"
let langPack = langPacks[lang];
let configuration = new Configuration(4, 1, "en", false, 100, false, false, "en", {}, 100);
const counterVersion = "2.05_beta"; //do not use - because if i want to import configuration from v1 it isn't going to be nice

const debug_settingsmenu = false;

//these 2 values are going to be overwritten in initialize()
let configurationSaveKey = "v2_configuration";
let countersSaveKey = "v2_counters";

const configurationSaveKeyTemplate = "v2_configuration";
const countersSaveKeyTemplate = "v2_counters";

function saveLastProfileInUse(){
    localStorage.setItem("profile", profile);
}

function getProfileList(){
    let profilesList = [];
    for(var i in localStorage)
    {
        if(i.startsWith("v2_configuration_profile_")){
            profilesList.push(i.replace("v2_configuration_profile_", ""));
        }
    }
    return profilesList;
}

/**
 * 
 * @param {*} zoomLevel from 0 to 1 decimal
 */
function setZoomOnCounters(zoomLevel){
    if(zoomLevel >= 96 && zoomLevel <= 104){
        zoomLevel = 100;
    }
    setText("zoomInfo", "zoom: "+zoomLevel+"%")
    get("containerForCounters").style.zoom = zoomLevel/100;
    configuration.counterZoomLevel = zoomLevel;
}

function addProfilesToSelectionMenu(){
    let selectMenu = get("profileSelect");
    selectMenu.innerHTML = ""
    for(var i of getProfileList()){
        var opt = document.createElement('option');
        opt.value = i;
        opt.innerHTML = i;
        selectMenu.appendChild(opt);
    }
    selectMenu.value = profile;
}

function loadLastProfileInUse(){
    savedProfile = localStorage.getItem("profile");
    if(savedProfile != null){
        profile = savedProfile;
        console.log(`[loadLastProfileInUse] loaded profile ${profile} from localStorage!`)
    }
}

function switchToProfile(profileName){
    if(profileName == "")
        return;
    profile = profileName;
    saveLastProfileInUse();
    location.reload();
}

function initialize(){
    loadLastProfileInUse();
    configurationSaveKey = getConfigurationSaveKey(profile);
    countersSaveKey = getCountersSaveKey(profile);
    loadConfiguration();
    loadCounters();
    saveLastProfileInUse();
    addProfilesToSelectionMenu();
    configUpdateLoop();
    setText("versionString", counterVersion);
    parseURLArguments();
    debuggingHelper();
}

function getConfigurationSaveKey(profileName){
    return `${configurationSaveKeyTemplate}_profile_${profileName}`;
}

function getCountersSaveKey(profileName){
    return `${countersSaveKeyTemplate}_profile_${profileName}`;
}

function debuggingHelper(){
    if(debug_settingsmenu){
        toggleSettingsMenu()
    }
}

function parseURLArguments(){
    const urlParams = new URLSearchParams(window.location.search);
    if(!urlParams.has("action")){
        return;
    }
    const action = urlParams.get("action");

    //don't support old V1 "add" actions. stick to supporting "set"
    if(action == "add"){

    }

    if(action == "set"){
        if(!urlParams.has("code"))
            return;
        let code = urlParams.get("code");
        code = code.replace("@GITHUB-", "@GITHUB_"); //this is stupid
        //code should always start from COUNTER@GITHUB_WOJGIE-[version in clear text]-...
        const importedVersion = code.split("-")[1];
        if(importedVersion.startsWith("v1.")){
            console.log("[parseURLArguments] trying to load old counters")
            loadOldCountersOrConfigsFromCodeLegacy(code, importedVersion, urlParams.get("type"), true);
        }else{
            console.log("[parseURLArguments] trying to load new counters")
            loadCountersOrConfigsFromCodeLatest(code, importedVersion, urlParams.get("type"), true);
        }
    }
}

function loadConfiguration(){
    let configurationString = localStorage.getItem(configurationSaveKey)
    if (configurationString == null){
        //configuration was initialized few lines above, so we can save it
        saveConfiguration();
        return
    }
    loadConfigurationString(configurationString);
}

//separate if i will add things in the future 
function loadConfigurationString(configurationString){
    configuration = JSON.parse(configurationString)
    if(configuration.counterZoomLevel == undefined){
        configuration.counterZoomLevel = 100;
    }
    setZoomOnCounters(configuration.counterZoomLevel)
}

function saveConfiguration(){
    localStorage.setItem(configurationSaveKey, JSON.stringify(configuration));
}

function loadCounters(){
    let countersString = localStorage.getItem(countersSaveKey)
    if (countersString == null){
        saveCounters(); //save blank
        return
    }
    let countersLoad = JSON.parse(countersString)
    if(isIterable(countersLoad)){
        for (const element of countersLoad) {
            const counter = getCounterFromElement(element);
            counters.push(counter);
            counter.addFrontendAndStart();
        }
    }
    saveCounters();
}

function addCounterToArrayAndFrontend(counter){
    counters.push(counter);
    counter.addFrontendAndStart();
    saveCounters()
    saveConfiguration()
}

function saveCounters(){
    localStorage.setItem(countersSaveKey, JSON.stringify(counters))
}


function Configuration(decimalPlacesPercentage, decimalPlacesSeconds, locale, hour12, updateMs, minimalMode, oled, langConfiguration, langPacksConfiguration, counterZoomLevel){
    this.decimalPlacesPercentage = decimalPlacesPercentage;
    this.decimalPlacesSeconds = decimalPlacesSeconds;
    this.locale = locale;
    this.hour12 = hour12;
    this.updateMs = updateMs;
    this.minimalMode = minimalMode;
    this.oled = oled;
    this.langConfiguration = langConfiguration;
    this.langPacksConfiguration = langPacksConfiguration;
    this.counterZoomLevel = counterZoomLevel;
}

async function configUpdateLoop(){
    console.log("[configuration-loop] updating configuration")
    saveCounters()
    saveConfiguration()
    setTimeout(function () { configUpdateLoop() }, 10000);
}


//OLD: date format is for example '2023-10-06T13:58'
//if we are adding things to a counter remember to add replacements to getCounterFromElement(element)
function Counter(title, divID, startDateMs, endDateMs, shouldRepeat){
    this.title = title;
    if(divID == null){
        divID = (Math.random() * 100000) + "_divCounter";
    }
    this.divID = divID;
    this.startDateMs = startDateMs;
    this.endDateMs = endDateMs;
    if(shouldRepeat == null || shouldRepeat === undefined){
        shouldRepeat = false;
    }
    this.shouldRepeat = shouldRepeat;

    
    this.update = async function update(){
        const startCalcMs = Date.now();
        const counterData = getCounterData(this.startDateMs, this.endDateMs, -1, configuration.decimalPlacesPercentage, configuration.decimalPlacesSeconds, configuration.locale, configuration.hour12);
        let updateMsThisTime = configuration.updateMs;
        let titleThisUpdate = this.title;

        let diff = this.endDateMs-this.startDateMs;
        if(counterData.minutesLeft < 0 && this.shouldRepeat){
            this.endDateMs += diff;
            this.startDateMs += diff;
            updateMsThisTime = 0;
            titleThisUpdate = "[SYNC]";
            console.log("[counter-main] sync [+]")
        }
        // if(counterData.percentageNumber > 100 && this.shouldRepeat){ // we are too early
        //     this.endDateMs -= diff;
        //     this.startDateMs -= diff;
        //     updateMsThisTime = 0;
        //     titleThisUpdate = "[SYNC-]";
        //     console.log("[counter-main] sync [-]")
        // }


        document.getElementById("span_"+divID).innerHTML = `
            ${titleThisUpdate} <br>
            ${langPack["counter.countTo"]}: ${counterData.formattedDate} <br>
            ${langPack["counter.weeks"]}: ${counterData.weeksLeft} <br>
            ${langPack["counter.days"]}: ${counterData.daysLeft} <br>
            ${langPack["counter.hours"]}: ${counterData.hoursLeft} <br>
            ${langPack["counter.minutes"]}: ${counterData.minutesLeft} <br>
            ${langPack["counter.seconds"]}: ${counterData.secondsLeftString} <br>
            ${langPack["counter.percentage"]}: ${counterData.percentageString} <br>
            ${langPack["counter.wWeekends"]}: ${counterData.workDaysLeft} `

        const diffMs = Date.now()-startCalcMs;
        if(diffMs > 30){
            console.log(`[counter-main] perf problem at counter \"${this.title}\" main update: ${diffMs}ms`)
        }

        var literallyThis = this;
        setTimeout(function () { literallyThis.update() }, updateMsThisTime);
    }

    this.offsetCounterByMs = function offsetCounterByMs(ms){
        this.startDateMs += ms;
        this.endDateMs += ms;
    }

    this.addFrontendAndStart = async function addFrontendAndStart(){
        let div = document.createElement("div");
        div.className = "mainFont divMain"
        div.id = this.divID;
        div.innerHTML = `<span id="span_${this.divID}"></span><span class="countercontrols" style="display: none;" id="controls_${this.divID}"><br><br>
            offset by an hour <input type="button" class="cyuibuttoncolordark" value="+" onclick="getCounterByTitleAndOffset('${this.title}', ${1000*60*60})"><input type="button" class="cyuibuttoncolordark" value="-" onclick="getCounterByTitleAndOffset('${this.title}', ${1000*60*60*-1})"> <br>
            offset by an minute <input type="button" class="cyuibuttoncolordark" value="+" onclick="getCounterByTitleAndOffset('${this.title}', ${1000*60})"><input type="button" class="cyuibuttoncolordark" value="-" onclick="getCounterByTitleAndOffset('${this.title}', ${1000*60*-1})"> <br>
            <input type="button" class="cyuibuttoncolordark" value="remove" onclick="getCounterByTitleAndRemoveIt('${this.title}')"> <input type="button" class="cyuibuttoncolordark" value="toggle repeat" onclick="getCounterByTitleAndToggleRepeat('${this.title}')"> 
            </span>`
        document.getElementById("moreDivs").after(div);
        this.update();
        saveCounters();
    }
}

const isThereACounterWithThisTitle = (title) => counters.some((element) => element.title === title);
const getCounterByTitle = (title) => counters.find(element => element.title === title) || null;

let modMenuOpen = false;
function toggleCounterEditModMenu(){
    modMenuOpen = !modMenuOpen;
    let displayStyle = "";
    if(!modMenuOpen){
        displayStyle = "none";
    }
    const counterControls = document.querySelectorAll('.countercontrols');
    for(const element of counterControls){
        element.style.display = displayStyle;
    }
}

function getCounterByTitleAndOffset(title, ms){
    const cntr = getCounterByTitle(title)
    if(cntr == null){
        alert(`${title} not found! (internal error?)`)
        return
    }
    cntr.offsetCounterByMs(ms);
    console.log(`[counter-edit] counter "${title}" offset by ${ms}`)
}
function getCounterByTitleAndToggleRepeat(title){
    const cntr = getCounterByTitle(title)
    if(cntr == null){
        alert(`${title} not found! (internal error?)`)
        return
    }
    cntr.shouldRepeat = !cntr.shouldRepeat;
    
    console.log(`[counter-edit] counter "${title}" repeat set to ${cntr.shouldRepeat}`)
    alert(`Current repeat status: ${cntr.shouldRepeat}`)
}
function getCounterByTitleAndRemoveIt(title){
    const cntr = getCounterByTitle(title)
    if(cntr == null){
        alert(`${title} not found! (internal error?)`)
        return
    }
    const index = counters.findIndex(element => element.title === title);
    counters.splice(index, 1);
    saveCounters()
    saveConfiguration()
    console.log(`[counter-edit] counter "${title}" removed`)
    location.reload();
}

let settingsMenuStatus = false;
function toggleSettingsMenu(){
    if(settingsMenuStatus){
        get("settingsMenuButton").style.display = "";
        get("settingsMenu").style.display = "none";
    }else{
        get("settingsMenuButton").style.display = "none";
        get("settingsMenu").style.display = "";
    }
    settingsMenuStatus = !settingsMenuStatus;
}

function getCounterFromElement(element){
    return new Counter(element.title, element.divID, element.startDateMs, element.endDateMs, element.shouldRepeat);
}

function isAWorkDayFilter(data){
    return true;
}

function percentageBetweenNumbers(start, curr, end) {
    const msInBetween = (end - start);
    const currentMinusStart = curr - start;
    const msInBetweenCurrAndEnd = (msInBetween - currentMinusStart);
    return (msInBetweenCurrAndEnd / msInBetween) * 100;
}

function getDatesInRange(startDate, endDate) {
    const date = new Date(startDate.getTime());

    const dates = [];

    while (date <= endDate) {
        dates.push(new Date(date));
        date.setDate(date.getDate() + 1);
    }

    return dates;
}

function deleteProfile(profileToDeletion){
    const configKey = getConfigurationSaveKey(profileToDeletion);
    const counterKey = getCountersSaveKey(profileToDeletion);
    localStorage.removeItem(configKey)
    localStorage.removeItem(counterKey)
    console.log(`[counter-edit] config: ${configKey} counter: ${counterKey}`)
    alert("profile deleted")
    if(profile == profileToDeletion){
        profile = "main";
        location.reload();
    }
    addProfilesToSelectionMenu();
}

//todo all todos
//langPacks and lang stuff
//exporting/loading counters as a URL from v2