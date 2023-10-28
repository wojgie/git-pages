///?action=set&type=full&code=COUNTER@GITHUB_WOJGIE-[version in clear text]-[COUNTERS IN BASE64]-[CONFIG IN BASE64]-[PROFILE IN BASE64]
function getCounterInstanceAsURLCode(profileName){
    return `?action=set&type=full&code=COUNTER-${counterVersion}-${btoa(localStorage.getItem(countersSaveKey))}-${btoa(localStorage.getItem(configurationSaveKey))}-${btoa(profileName)}`
}

function loadCountersOrConfigsFromCodeLatest(code, importedVersion, configType, makeNewProfile){
    const counters = atob(code.split("-")[2]);
    const config = atob(code.split("-")[3]);
    const profileNameURL = atob(code.split("-")[4]);
    const profileName = profileNameURL;

    if(makeNewProfile){
        if(profile != profileName){
            profile = profileName;
            saveLastProfileInUse();
            location.reload();
            return
        }
    }

    localStorage.setItem(configurationSaveKey, config);
    localStorage.setItem(countersSaveKey, counters);

    alert("loaded counters and config.")

    location.href = location.pathname;
}
const baseURL = location.protocol + '//' + location.host + location.pathname;
function getCounterInstance(profileName){
    alert(`${baseURL}${getCounterInstanceAsURLCode(profileName)}`)
}
