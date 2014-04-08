function updateClock() {
    var currentMonth
    var currentTime = new Date();

    var currentHours = currentTime.getHours();
    var currentMinutes = currentTime.getMinutes();
    var currentSeconds = currentTime.getSeconds();
    var monthNumber = currentTime.getMonth() + 1;
    var currentDate = currentTime.getDate();
    var currentYear = currentTime.getYear();

    // Pad the minutes and seconds with leading zeros, if required
    currentMinutes = (currentMinutes < 10 ? "0" : "") + currentMinutes;
    currentSeconds = (currentSeconds < 10 ? "0" : "") + currentSeconds;

    // Choose either "AM" or "PM" as appropriate
    var timeOfDay = (currentHours < 12) ? "AM" : "PM";

    // Convert the hours component to 12-hour format if needed
    currentHours = (currentHours > 12) ? currentHours - 0 : currentHours;

    // Convert an hours component of "0" to "12"
    currentHours = (currentHours == 0) ? 12 : currentHours;

    //Convert month number to month name
    if (monthNumber == 1) {
        currentMonth = "January"
    }
    else if (monthNumber == 2) {
        currentMonth = "February"
    }
    else if (monthNumber == 3) {
        currentMonth = "March"
    }
    else if (monthNumber == 4) {
        currentMonth = "April"
    }
    else if (monthNumber == 5) {
        currentMonth = "May"
    }
    else if (monthNumber == 6) {
        currentMonth = "June"
    }
    else if (monthNumber == 7) {
        currentMonth = "July"
    }
    else if (monthNumber == 8) {
        currentMonth = "August"
    }
    else if (monthNumber == 9) {
        currentMonth = "September"
    }
    else if (monthNumber == 10) {
        currentMonth = "October"
    }
    else if (monthNumber == 11) {
        currentMonth = "November"
    }
    else if (monthNumber == 12) {
        currentMonth = "December"
    }

    // Compose the string for display
    var currentTimeString = currentMonth + " " + currentDate + ", " + currentYear + " " + currentHours + ":" + currentMinutes + ":" + currentSeconds + " " + timeOfDay;

    // Update the time display
    document.getElementById("clock").firstChild.nodeValue = currentTimeString;

}

var g_alertsOn = false;
function timedMsg() 
{
    if (g_alertsOn == false)
    {
        showAlerts();   
    }
    else // g_alertsOn == true
    {
        hideAlerts();   
    }
}

function showAlerts()
{
    //var at = setTimeout("loadKml('Alert1')", 5000);
    var at = setTimeout("BWorks.UpdateScene('Alarm1 (Show).xml')", 5000);
    var aa = setTimeout("show('row1')", 5005);
    //var b = setTimeout("loadKml('Alert2')", 10000);
    var b = setTimeout("BWorks.UpdateScene('Alarm2 (Show).xml')", 10000);
    var bb = setTimeout("show('row2')", 10005);
    //var c = setTimeout("loadKml('Alert3')", 15000);
    //var bb = setTimeout("show('row3')", 15005);

    g_alertsOn = true;
}

function hideAlerts()
{
    BWorks.UpdateScene('Alarm1 (Hide).xml');
    hide('row1');
    BWorks.UpdateScene('Alarm2 (Hide).xml');
    hide('row2');

    g_alertsOn = false;
}

function show(id) {
    document.getElementById(id).style.visibility = "visible";
}


function hide(id) {
    document.getElementById(id).style.visibility = "hidden";
}


function go(loc) {
    tables.location.href = loc;
}


function go(loc) {
    tables.location.href = loc;
}


//on checklist.htm load, hide all but top table (tableOne)
function hideTables() {
    hide('tableTwo');
    hide('tableThree');
    hide('tableFour');
}


function showHideTable(id) {
    if (document.getElementById(id).style.visibility == "hidden") {
        show(id);
    }
    else //hide box
    {
        hide(id);

        if (id == 'tableTwo') {
            hide('tableThree');
            document.getElementById('checkbox3').checked = false;
            document.getElementById('checkbox2').checked = false;
            hide('tableFour');

        }

        if (id == 'tableThree') {
            hide('tableFour');
            document.getElementById('checkbox3').checked = false;
        }
    }
}

function divExpandCollapse(divID) {
    var currentState = document.getElementById(divID).style.display;
    //alert(currentState);
    if (currentState == 'block') {
        document.getElementById(divID).style.display = 'none';
        document.getElementById(divID + '_Arrow').src = 'UI/images/arrow.gif';
    }
    else {
        document.getElementById(divID).style.display = 'block';
        document.getElementById(divID + '_Arrow').src = 'UI/images/arrowDown.gif';
    }
}

function divExpand(divID)
{
    document.getElementById(divID).style.display = 'block';
    document.getElementById(divID + '_Arrow').src = 'UI/images/arrowDown.gif';
}

function divCollapse(divID)
{
    document.getElementById(divID).style.display = 'none';
    document.getElementById(divID + '_Arrow').src = 'UI/images/arrow.gif';
}

    
    
 