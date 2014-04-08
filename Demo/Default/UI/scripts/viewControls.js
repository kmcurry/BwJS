var smokeStarted = false;

function toggleBridgeworks(checkboxName) {
    
    var checkbox = document.getElementById(checkboxName);

    if (checkbox.checked == true) {
        quickUpdate(checkboxName + " (Show).xml");
        if (checkboxName == "Weather") {
            getWeather();
        }
        if (checkboxName == "Smoke" && !smokeStarted)
        {
            startSmoke();
            smokeStarted = true;
        }
    }
    else {
        quickUpdate(checkboxName + " (Hide).xml");
    }

    

}

function locateCamera() {
    cameraName = document.getElementById("cameraList").value;
    Bridgeworks.UpdateScene("Locate " + cameraName + ".xml");

}

function getWeather()
{
    var url = "getWeather.aspx";   
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", url, false);
    try
    {
        xmlhttp.send();

        var xmlDoc = xmlhttp.responseXML;
        if (xmlDoc)
        {
            parseWeather(xmlDoc);
        }
        return;
    }
    catch (Error) 
    {
        // failed
    }
}

function loadWeather(xmlhttp)
{
    var xmlDoc = null;
    var browser = navigator.appName;

    if (browser.indexOf("Netscape") != -1 ||
                browser.indexOf("Opera") != -1)
    {
        var parser = new DOMParser();
        xmlDoc = parser.parseFromString(xmlhttp, "text/xml");
    }
    else if (browser.indexOf("Microsoft") != -1)
    {
        xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
        xmlDoc.loadXML(xmlhttp);
    }
    else // unsupported browser
    {
    }

    return xmlDoc;
}

function parseWeather(xmlDoc)
{
    var location = xmlDoc.getElementsByTagName("location")[0].childNodes[0].nodeValue;
    var observation_time = xmlDoc.getElementsByTagName("observation_time")[0].childNodes[0].nodeValue;
    var weather = xmlDoc.getElementsByTagName("weather")[0].childNodes[0].nodeValue;
    var temperature_string = xmlDoc.getElementsByTagName("temperature_string")[0].childNodes[0].nodeValue;
    var relative_humidity = xmlDoc.getElementsByTagName("relative_humidity")[0].childNodes[0].nodeValue;
    var wind_string = xmlDoc.getElementsByTagName("wind_string")[0].childNodes[0].nodeValue;
    var wind_degrees = xmlDoc.getElementsByTagName("wind_degrees")[0].childNodes[0].nodeValue;
    var wind_mph = xmlDoc.getElementsByTagName("wind_mph")[0].childNodes[0].nodeValue;
    var visibility_mi = xmlDoc.getElementsByTagName("visibility_mi")[0].childNodes[0].nodeValue;
    var pressure_string = xmlDoc.getElementsByTagName("pressure_string")[0].childNodes[0].nodeValue;

    var fog = .003 / visibility_mi;
    
    var weather_string = "<Update>"+
    "<Set target='Label_Weather1' text='" + observation_time + "'/>"+
    "<Set target='Label_Weather2' text='Weather: " + weather + "'/>"+
    "<Set target='Label_Weather3' text='Temperature: " + temperature_string + "'/>"+
    "<Set target='Label_Weather4' text='Visibility (miles): " + visibility_mi + "'/>" +
    "<Set target='Label_Weather5' text='Relative Humidity: " + relative_humidity + "'/>"+
    "<Set target='Label_Weather6' text='Wind: " + wind_string + "'/>" +
    "<Set target='Label_Weather7' text='Wind Direction (degrees): " + wind_degrees + "'/>" +
    "<AutoInterpolate duration ='3' target='Flag'><rotation x='0' y='" + wind_degrees + "' z='0' /></AutoInterpolate>" +
    "<AutoInterpolate target='Fog' density='" + fog + "'/>" +
    "</Update>";
     
    //alert(weather_string);
    Bridgeworks.UpdateScene(weather_string);

    // get wind speed in m/s
    var wind_ms = wind_mph * 0.448;
    
    // update smoke objects
    updateSmoke(parseFloat(wind_degrees), wind_ms);
}

function startSmoke()
{
    _startSmoke(1);
}

function updateSmoke(wind_heading_degrees, wind_ms)
{
    _updateSmoke(1, wind_heading_degrees, wind_ms);
    _updateSmoke(2, wind_heading_degrees, wind_ms);
    _updateSmoke(3, wind_heading_degrees, wind_ms);
    _updateSmoke(4, wind_heading_degrees, wind_ms);
    _updateSmoke(5, wind_heading_degrees, wind_ms);
    _updateSmoke(6, wind_heading_degrees, wind_ms);
    _updateSmoke(7, wind_heading_degrees, wind_ms);
    _updateSmoke(8, wind_heading_degrees, wind_ms);
    _updateSmoke(9, wind_heading_degrees, wind_ms);
    _updateSmoke(10, wind_heading_degrees, wind_ms);
}

function _startSmoke(n)
{
    if (n > 10) return; // last smoke object reached
    
    var smoke_string =
    "<Update>" +
        "<Remove target='AI_Smoke_" + n + "'/>" +
        "<AutoInterpolate name='AI_Smoke_" + n + "' duration='5' postBehavior='2' target='Smoke_" + n + "'>" +
            "<scale x='5' y='5' z='5'/>" +
            "<dissolve>1</dissolve>" +
        "</AutoInterpolate>" +
        "<Set target='VE_Smoke_" + n + "' enabled='true'>" +
        "</Set>" +
    "</Update>";

    //alert(smoke_string);
    Bridgeworks.UpdateScene(smoke_string);
        
    // wait 500 ms then start the next smoke object
    n += 1;
    setTimeout("_startSmoke(" + n + ")", 500);
}

function _updateSmoke(n, wind_heading_degrees, wind_ms)
{ 
    // convert heading degrees to cartesian coordinates (convert to radians first)
    var wind_x = wind_ms * Math.cos(wind_heading_degrees * Math.PI / 180);
    var wind_y = wind_ms;
    var wind_z = wind_ms * Math.sin(wind_heading_degrees * Math.PI / 180);
    
    var smoke_string =
    "<Update>" +
        "<AutoInterpolate duration='5' target='VE_Smoke_" + n + "'>" +
            "<linearVelocity x='" + wind_x + "' y='" + wind_y + "' z='" + wind_z + "'/>" +
        "</AutoInterpolate>" +
    "</Update>";

    //alert(smoke_string);
    Bridgeworks.UpdateScene(smoke_string);
}