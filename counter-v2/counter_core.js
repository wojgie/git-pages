function counterDataPack(formattedDate, weeksLeft, daysLeft, hoursLeft, minutesLeft, secondsLeft, workDaysLeft, percentageString, secondsLeftString, percentageNumber){
    this.formattedDate = formattedDate; // string
    this.weeksLeft = weeksLeft; // int
    this.daysLeft = daysLeft; // int
    this.hoursLeft = hoursLeft; //int
    this.minutesLeft = minutesLeft; // int
    this.secondsLeft = secondsLeft; // floating point
    this.workDaysLeft = workDaysLeft; // int
    this.percentageString = percentageString; // string
    this.secondsLeftString = secondsLeftString; // string
    this.percentageNumber = percentageNumber; // floating point
}

function getCounterData(startMs, endMs, currentDateMs, decimalPlacesPercentage, decimalPlacesSeconds, localeString, hour12Boolean){
    const startDate = new Date(startMs);
    const endDate = new Date(endMs);
    let currentDate = new Date();
    if(currentDateMs != -1)
        currentDate = new Date(currentDateMs);
    let diff = endDate.getTime() - currentDate.getTime()

    let percentageNumber = percentageBetweenNumbers(startDate.getTime(), currentDate.getTime(), endDate.getTime());
    let percentage = percentageNumber.toFixed(decimalPlacesPercentage) + " %";

    let workDays = 0;
    getDatesInRange(currentDate, endDate).forEach(function (item, index) {
        if (isAWorkDay(item)) {
            workDays++;
        }
    }); 
    if(isAWorkDay(currentDate)) workDays--;
    //workDays = workDays < 0 ? 0 : workDays;
    if(workDays < 0)
        console.log("[counter-core] workDays calculations are wrong.")

    let seconds = (diff / 1000);
    let secondsFixed = seconds.toFixed(decimalPlacesSeconds);
    let minutes = Math.floor(diff / 1000 / 60)
    let hours = Math.floor(diff / 1000 / 60 / 60)
    let days = Math.floor(diff / 1000 / 60 / 60 / 24)
    let weeks = Math.floor(diff / 1000 / 60 / 60 / 24 / 7)

    let formattedDate = endDate.toLocaleString(localeString, {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: hour12Boolean
    });
    return new counterDataPack(formattedDate, weeks, days, hours, minutes, seconds, workDays, percentage, secondsFixed, percentageNumber)
}

function isAWorkDay(item){
    return item.getDay() != 0 && item.getDay() != 6;
}