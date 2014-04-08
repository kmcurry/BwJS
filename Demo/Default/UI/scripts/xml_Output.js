/**
*  Purpose:  To provide a styled XML output while running locally.
*  Dependancy : crossbrowser.js
*/

function CheckWellFormed(xml)
{
    //var xml = g_domUpdateScene
    //var xml = document.getElementById("fieldDebug").value

    //alert(xml);
    if (xml == null)
    {
        //var xml = "Empty";
        alert("Current scene is Empty.");
    }
    else
    {
        //var xml = g_domUpdateScene.xml
        var result = TransformToString(xml, "UI/transformations/xml_Output.xsl"); //dom.transformNode(xsl);        //!CROSSBROWSER
        //alert (result);
        var win = open('', "Example", 'scrollbars=yes,resizable=yes,width=800,height=600,screenX=50,screenY=50,top=50,left=50');
        win.document.open();
        win.document.write(result);
        win.document.close();
    }
}


function CreateXMLDocument()
{
    var dom = null;
    if (typeof XMLDocument != "undefined")
    {
        dom = document.implementation.createDocument("", "", null);
    }
    else if (typeof ActiveXObject != "undefined")
    {
        dom = new ActiveXObject("Msxml2.DomDocument.3.0");
    }
    else
    {
        throw new Error("XMLDomDocument not supported");
    }
    dom.async = false;  // change default b/c most common use is sync.
    return dom;
}

function GetXMLString(dom)
{
    var result = "";
    if (typeof XMLSerializer != "undefined")
    {
        var s = new XMLSerializer();
        result = s.serializeToString(dom);
    }
    else if (dom.xml != "undefined")
    {
        result = dom.xml;
    }
    else
    {
        throw new Error("XMLSerializer not supported");
    }
    return result;
}

function LoadXMLString(s)
{
    var result = null;
    if (typeof DOMParser != "undefined")
    {
        var parser = new DOMParser();
        result = parser.parseFromString(s, "text/xml");
    }
    else
    {
        var dom = CreateXMLDocument();
        if (dom)
        {
            dom.loadXML(s);
            result = dom;
        }
    }
    return result;
}

function ProxyXMLHttpRequest(url)
{
    xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", url, false);
    try
    {
        xmlhttp.send();
        var xmlDoc = xmlhttp.responseXML;
        return xmlDoc;
    }
    catch (Error)
    {
        // cross-domain attempt failed... try proxy below
    }

    var proxy = 'UI/scripts/ba-simple-proxy.php',
        url = proxy + '?url=' + url;

    // Test to see if HTML mode.
    if (/mode=native/.test(url))
    {
        // Make GET request.
        $.get(url, function(data)
        {
            if (data && data.contents)
            {
                var xmlDoc = null;
                var browser = navigator.appName;

                if (browser.indexOf("Netscape") != -1 ||
                browser.indexOf("Opera") != -1)
                {
                    var parser = new DOMParser();
                    xmlDoc = parser.parseFromString(data.contents, "text/xml");
                }
                else if (browser.indexOf("Microsoft") != -1)
                {
                    xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
                    xmlDoc.loadXML(data.contents);
                }
                else // unsupported browser
                {
                }

                return xmlDoc;
            }
        });

    } else
    {
        // Make JSON request.
        $.getJSON(url, function(data)
        {
            if (data && data.contents)
            {
                var xmlDoc = null;
                var browser = navigator.appName;

                if (browser.indexOf("Netscape") != -1 ||
                browser.indexOf("Opera") != -1)
                {
                    var parser = new DOMParser();
                    xmlDoc = parser.parseFromString(data.contents, "text/xml");
                }
                else if (browser.indexOf("Microsoft") != -1)
                {
                    xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
                    xmlDoc.loadXML(data.contents);
                }
                else // unsupported browser
                {
                }

                return xmlDoc;
            }
        });
    }
}

function TransformToString(xmlSrc, xformUrl)
{
    // Create XSLT processor
    var result = ""

    var dom = null;

    // determine if xmlSrc is a string of XML or URL

    if (xmlSrc.indexOf("<") != -1)
    {
        dom = LoadXMLString(xmlSrc);
    }
    else
    {
        dom = CreateXMLDocument();
        dom.load(xmlSrc);
    }

    var xform = CreateXMLDocument();

    try
    {
        xform.load(xformUrl);
    }
    catch (e)
    {
        xform = ProxyXMLHttpRequest(document.location.href + "/../UI/transformations/xml_Output.xsl");  
    }
        
    if (dom.childNodes.length > 0)// && xform.childNodes.length > 0)
    {
        var b = whichBrowser();
        switch (b)
        {
            case ('M'):
                {
                    result = dom.transformNode(xform);
                }
                break;
            case ('N'):
                {
                    var processor = createXSLTProcessor();
                    processor.importStylesheet(xform);

                    var output = processor.transformToDocument(dom);
                    result = GetXMLString(output);
                }
                break;
            default:
                break;
        }
    }
    return result;
}


