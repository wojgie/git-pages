let langPacks = {}

langPacks["en"] = JSON.parse("{\"counter.countTo\":\"counting to\",\"counter.weeks\":\"weeks\",\"counter.days\":\"days\",\"counter.hours\":\"hours\",\"counter.minutes\":\"minutes\",\"counter.seconds\":\"seconds\",\"counter.percentage\":\"percentage\",\"counter.wWeekends\":\"without weekends (days)\",\"html.header\":\"Counter\",\"counter.finished\":\"Counting finished\",\"counter.finishedVacations\":\"Counting finished! see you in September\",\"html.title\":\"Counter | catzone.xyz\"}")



let CFG = null;
let lang = "en"
let langLocaleString = "en"


function defaultConfig() {
    CFG = new Config(3, 1000, 0, "14px");
}

defaultConfig()

function updateConfig(config) {
    CFG = config;
    localStorage.setItem("config", JSON.stringify(config))
}

function Config(fixedPercentage, updateMs, fixedSeconds, fontPX) {
    if (fixedPercentage == "") {
        fixedPercentage = 3;
    }
    if (updateMs == "") {
        updateMs = 1000;
    }
    if (fixedSeconds == "") {
        fixedSeconds = 0;
    }
    if (fontPX == "") {
        fontPX = "14px"
    }
    this.fontPX = fontPX;
    this.fixedPercentage = fixedPercentage;
    this.updateMs = updateMs;
    this.fixedSeconds = fixedSeconds;
}

let animated = false;

/** main thread to perform updatse. MONTH STARTS WITH 0-11 */
async function update(divName, year, month, day, hour, startYear, startMonth, startDay, startHour, desc, Sminutes, minutes2) {
    let langPack = langPacks[lang]
    langLocaleString = "en"
    document.title = langPack["html.title"]
    document.getElementById("header").innerHTML = langPack["html.header"]
    document.getElementById(divName).style.fontSize = CFG.fontPX;

    let currentDate = new Date();
    let dateEnd = new Date(year, month, day, hour, minutes2)
    let diff = dateEnd.getTime() - currentDate.getTime()


    let percentage = "startYear not specified"
    if (startYear != null) {
        percentage = percentageBetweenNumbers(new Date(startYear, startMonth, startDay, startHour, Sminutes).getTime(), currentDate.getTime(), dateEnd.getTime()).toFixed(CFG.fixedPercentage) + " %";
    }



    //to get free days we need to check if .getDay() isn't 0 or 6 (sunday, saturday)

    let nonSundayOrSatDays = 0;
    getDatesInRange(currentDate, dateEnd).forEach(function (item, index) {
        if (item.getDay() != 0 && item.getDay() != 6) {
            nonSundayOrSatDays++;
        }
    })
    nonSundayOrSatDays--; //remove 1 so that if its the same day it says "0 days"

    let seconds = (diff / 1000).toFixed(CFG.fixedSeconds);
    let minutes = Math.floor(diff / 1000 / 60)
    let hours = Math.floor(diff / 1000 / 60 / 60)
    let days = Math.floor(diff / 1000 / 60 / 60 / 24)
    let weeks = Math.floor(diff / 1000 / 60 / 60 / 24 / 7)


    //hangs for 60 seconds
    if(seconds > -60 && seconds <= 0){
        seconds = (0).toFixed(CFG.fixedSeconds);
        minutes = 0;
        hours = 0;
        days = 0;
        weeks = 0;
        nonSundayOrSatDays = 0;
        percentage = (0).toFixed(CFG.fixedPercentage) + " %";
        if(!animated){
            party.confetti(document.getElementById(divName), {
                count: party.variation.range(60, 100),
            });
        }
        animated = true
        document.body.className = "body colors"
        document.getElementById(divName).className = "mainFont divMain wave"
    }else{
        if(animated){
            party.confetti(document.getElementById(divName), {
                count: party.variation.range(85, 108),
            });
        }
        animated = false;
        document.body.className = "body"
        document.getElementById(divName).className = "mainFont divMain"
    }


    const formattedDate = dateEnd.toLocaleString(langLocaleString, {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit"
    });

    //nonSundayOrSatDays
    document.getElementById(divName).innerHTML = `
    ${desc} <br>
    ${langPack["counter.countTo"]}: ${formattedDate} <br>
    ${langPack["counter.weeks"]}: ${weeks} <br>
    ${langPack["counter.days"]}: ${days} <br>
    ${langPack["counter.hours"]}: ${hours} <br>
    ${langPack["counter.minutes"]}: ${minutes} <br>
    ${langPack["counter.seconds"]}: ${seconds} <br>
    ${langPack["counter.percentage"]}: ${percentage} <br>
    ${langPack["counter.wWeekends"]}: ${nonSundayOrSatDays} `
    
    if(seconds < 0){
        if(currentDate.getMonth() == 5 && currentDate.getDate() == 24){
            document.getElementById(divName).innerHTML = langPack["counter.finishedVacations"]
        }else{
            document.getElementById(divName).innerHTML = langPack["counter.finished"]
        }
    }


    setTimeout(function () { update(divName, year, month, day, hour, startYear, startMonth, startDay, startHour, desc, Sminutes, minutes2) }, CFG.updateMs);
}

function percentageBetweenNumbers(start, curr, end) {
    const msInBetween = (end - start);
    const currentMinusStart = curr - start;
    const msInBetweenCurrAndEnd = (msInBetween - currentMinusStart);
    return (msInBetweenCurrAndEnd / msInBetween) * 100;
}

/**
 * i am bad at js, especially date related stuff, i didn't realize the months are from 0, for a fucking hour.
 * @param {*} startDate 
 * @param {*} endDate 
 * @returns 
 */
function getDatesInRange(startDate, endDate) {
    const date = new Date(startDate.getTime());

    const dates = [];

    while (date <= endDate) {
        dates.push(new Date(date));
        date.setDate(date.getDate() + 1);
    }

    return dates;
}

function loadLangPreffered() {
    let prefL = localStorage.getItem("prefferedLang");
    if (prefL != null) {
        if (prefL == "en") {
            lang = prefL;
            return
        }
        lang = prefL;
        langPacks[prefL] = JSON.parse(localStorage.getItem(prefL))
    }
}

//lang related stuff
function addLang(json) {
    let langpackShort = document.getElementById("langpackShort").value;
    langPacks[langpackShort] = json;
    localStorage.setItem(langpackShort, json);
}

function loadDivs() {
    let divString = localStorage.getItem("divs")
    if (divString == null)
        return
    divs = JSON.parse(divString)
    for (const element of divs) {
        let div = document.createElement("div");
        div.className = "mainFont divMain"
        div.id = (Math.random() * 100000) + "_divCounter"
        document.getElementById("moreDivs").after(div);

        let Sminutes = 0;
        let minutes = 0;
        if(element.Sminutes !== undefined){
            Sminutes = element.Sminutes;
            minutes = element.minutes;
        }

        update(div.id, element.year, element.month, element.day, element.hour, element.syear, element.smonth, element.sday, element.shour, element.desc, Sminutes, minutes)
    }
}

function clearDivs(){
    localStorage.setItem("divs", "[]")
}

function loadConfig() {
    let configString = localStorage.getItem("config")
    if (configString == null)
        return
    CFG = JSON.parse(configString)
}

var divs = []

function addCounter() {
    let div = document.createElement("div");
    div.className = "mainFont divMain"
    div.id = (Math.random() * 100000) + "_divCounter"
    document.getElementById("moreDivs").after(div);

    update(div.id, val("year"), val('month'), val('day'), val('hour'), val("Syear"), val('Smonth'), val('Sday'), val('Shour'), val("desccounter"), val("Sminutes"), val("minutes"))
    divs.push(new counterDiv(val("year"), val('month'), val('day'), val('hour'), val("Syear"), val('Smonth'), val('Sday'), val('Shour'), val("desccounter"), val("Sminutes"), val("minutes")))
    localStorage.setItem("divs", JSON.stringify(divs))
}

function counterDiv(year, month, day, hour, syear, smonth, sday, shour, desc, Sminutes, minutes) {
    this.year = year;
    this.month = month;
    this.day = day;
    this.hour = hour;
    this.syear = syear;
    this.smonth = smonth;
    this.sday = sday;
    this.shour = shour;
    this.desc = desc;
    this.Sminutes = Sminutes;
    this.minutes = minutes;
}

function val(id) {
    return document.getElementById(id).value;
}
