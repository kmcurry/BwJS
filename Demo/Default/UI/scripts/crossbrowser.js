// JScript File
function createXMLHttpRequest()
{
    if (typeof XMLHttpRequest != "undefined")
    {
        /*
        try 
        {
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
        }
        catch (e)
        {
        alert("Permission UniversalBrowserRead denied.");
        }
        */
        return new XMLHttpRequest();
    }
    else if (typeof ActiveXObject != "undefined")
    {
        return new ActiveXObject("Msxml2.XMLHTTP.3.0");
    }
    else
    {
        throw new Error("XMLHttpRequest not supported");
    }
}

function createXMLDomDocument()
{
    if (typeof XMLDocument != "undefined")
    {
        return document.implementation.createDocument("", "", null);
    }
    else if (typeof ActiveXObject != "undefined")
    {
        return new ActiveXObject("Msxml2.DomDocument.3.0");
    }
    else
    {
        throw new Error("XMLDomDocument not supported");
    }
}

function createXSLTProcessor()
{
    if (typeof XSLTProcessor != "undefined")
    {
        return new XSLTProcessor();
    }
    else if (typeof ActiveXObject != "undefined")
    {
        return new ActiveXObject("Msxml2.DomDocument.3.0");
    }
    else
    {
        throw new Error("XSLTProcessor not supported");
    }
}

function whichBrowser()
{
    var code = ""

    var browser = navigator.appName;

    if (browser.indexOf("Netscape") != -1)
    {
        code = 'N';
    }
    else if (browser.indexOf("Microsoft") != -1)
    {
        code = 'M';
    }
    return code;
}
