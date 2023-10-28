//old counters example [{"year":"2025","month":"1","day":"1","hour":"1","syear":"2017","smonth":"1","sday":"1","shour":"1","desccounter":"example","Sminutes":"1","minutes":"1"}]
//old config example {"fontPX":"14px","fixedPercentage":"3","updateMs":"1000","fixedSeconds":"0","minimalMode":false}
//latest version from counter v1 is "v1.14"
///?action=set&type=full&code=COUNTER@GITHUB_WOJGIE-[version in clear text]-[COUNTERS IN BASE64]-[CONFIG IN BASE64]
//code should be COUNTER@GITHUB_WOJGIE-[version in clear text]-[COUNTERS IN BASE64]-[CONFIG IN BASE64]
//configType in counter v1 had 2 options, "full" and "counters"
//"full" had config data as well
function loadOldCountersOrConfigsFromCodeLegacy(code, importedVersion, configType, makeNewProfile){
    if(makeNewProfile){
        const newProfileName = `imported_${importedVersion}`;
        if(profile != newProfileName){
            profile = newProfileName;
            saveLastProfileInUse();
            location.reload();
            return
        }
    }
    const countersOld = JSON.parse(atob(code.split("-")[2]));
    console.log(countersOld)
    let counterCount = 0, counterCountFailed = 0;
    for (const element of countersOld) {
        let dateStart = new Date(element.syear, element.smonth, element.sday, element.shour, element.Sminutes);
        let dateEnd = new Date(element.year, element.month, element.day, element.hour, element.minutes)
        if(!isThereACounterWithThisTitle(element.desccounter)){
            const newCounter = new Counter(element.desccounter, null, dateStart.getTime(), dateEnd.getTime(), false);
            addCounterToArrayAndFrontend(newCounter);
            counterCount++;
        }else{
            counterCountFailed++;
        }
    }

    let duplicatesData = ""
    if(counterCountFailed != 0){
        if(counterCountFailed == 1){
            duplicatesData = `\n${counterCountFailed} counter is duplicated, or has invalid data.`
        }else{
            duplicatesData = `\n${counterCountFailed} counters are duplicated, or have invalid data.`
        }
    }

    if(configType == "full"){
        const configOld = JSON.parse(atob(code.split("-")[3]));
        configuration.decimalPlacesPercentage = configOld.fixedPercentage;
        configuration.decimalPlacesSeconds = configOld.fixedSeconds;
        configuration.updateMs = configOld.updateMs;
        alert("loaded configuration")
    }

    saveCounters()
    saveConfiguration()
    saveLastProfileInUse();

    if(counterCountFailed != 0 || counterCount != 0){
        alert(`loaded ${counterCount} counters from version ${importedVersion}.${duplicatesData}`)
    }else{
        alert(`No counter has been loaded, there might be none but there might simply be an error.`)
    }
    location.href = location.pathname;
}