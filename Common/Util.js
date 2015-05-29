function loadBinaryResource(url, onload, onerror)
{
    var xhr = new XMLHttpRequest();
 
    xhr.open('GET', url, true);
    xhr.overrideMimeType('text/plain; charset=x-user-defined');    
    xhr.onload = function(e) 
    {
        if (xhr.readyState === 4) 
        {
            if (xhr.status === 200) 
            {
                if (onload) onload(xhr.responseText);
            } 
            else 
            {
                if (onerror) onerror(xhr.statusText);
            }
        }
    };
    xhr.onerror = function(e) 
    {
        if (onerror) onerror(xhr.statusText);
    };
    xhr.send(null);
}

function loadXMLResource(url, onload, onerror)
{
    var xhr = new XMLHttpRequest();
 
    xhr.open('GET', url, true);
    xhr.overrideMimeType('text/plain; charset=x-user-defined');    
    xhr.onload = function(e) 
    {
        if (xhr.readyState === 4) 
        {
            if (xhr.status === 200) 
            {
                if (onload) onload(xhr.responseText);
            } 
            else 
            {
                if (onerror) onerror(xhr.statusText);
            }
        }
    };
    xhr.onerror = function(e) 
    {
        if (onerror) onerror(xhr.statusText);
    };
    xhr.send(null);
}

function loadTextResource(url, onload, onerror)
{
    var xhr = new XMLHttpRequest();
 
    xhr.open('GET', url, true);
    xhr.overrideMimeType('text/plain; charset=x-user-defined');    
    xhr.onload = function(e) 
    {
        if (xhr.readyState === 4) 
        {
            if (xhr.status === 200) 
            {
                if (onload) onload(xhr.responseText);
            } 
            else 
            {
                if (onerror) onerror(xhr.statusText);
            }
        }
    };
    xhr.onerror = function(e) 
    {
        if (onerror) onerror(xhr.statusText);
    };
    xhr.send(null);
}

function isLower(c)
{
    var ascii = c.charCodeAt(0);
    return (ascii > 96 && ascii < 123);
}

function isUpper(c)
{
    var ascii = c.charCodeAt(0);
    return (ascii > 64 && ascii < 91);
}

function isSpace(c)
{
    if (c == ' '  || 
        c == '\f' ||
        c == '\n' ||
        c == '\r' ||
        c == '\t' ||
        c == '\v')
        return true;
        
    return false;
}

// From: http://blog.magnetiq.com/post/514962277/finding-out-class-names-of-javascript-objects
/* Returns the class name of the argument or undefined if
   it's not a valid JavaScript object.
*/
function getObjectClassName(obj) {
    if (obj && obj.constructor && obj.constructor.toString) {
        var arr = obj.constructor.toString().match(
            /function\s*(\w+)/);

        if (arr && arr.length == 2) {
            return arr[1];
        }
        
        // match [method name]
        arr = obj.constructor.toString().split(" ");
        
        if (arr && arr.length == 2) {
            return arr[1].substring(0, arr[1].length-1);
        }
    }

    return undefined;
}

/*  takes string to an absolute or relative URL 
    returns an array containing a valid Bw path
    and the expected content directory.
    DOES NOT ENSURE CONTENT EXISTS
    Treat is like our best guess
*/
function formatPath(url, onload, onerror)
{
    var result = [];
    
    var href = document.location.href;
    var validPath = url;
    var validDir  = href.substring(0, href.lastIndexOf("/")) + "/" + bridgeworks.contentDir + "/";

    if (!isFullPath(url))
    {        
        validPath = href.substring(0, href.lastIndexOf("/")) + "/" + bridgeworks.contentDir + "/" + url;
        
        var ndx = validPath.lastIndexOf("objects");
        if (ndx == -1) ndx = validPath.lastIndexOf("images");
        if (ndx == -1) ndx = validPath.lastIndexOf("motions");
        if (ndx == -1) ndx = validPath.lastIndexOf("envelopes");
        if (ndx == -1) ndx = validPath.lastIndexOf("scenes");
        if (ndx >=  0) ndx--;

        validDir = validPath.substring(0, ndx) + "/";
    }
    
    try 
    {
        $.ajax({
            url: validPath,
            type:'HEAD',
            async: true,
            error: function()
            {
                console.debug(validPath + " does not exist.");
                if (onerror) onerror(validPath, validDir);
            },
            success: function()
            {
                console.debug("File found: " + validPath);
                if (onload) onload(validPath, validDir);
            }
        });
    } 
    catch (e) 
    {       
    }
    
    return result;
}

function isWebURL(url)
{
    url.toLowerCase();
    
    if (url.indexOf("http:") >= 0 ||
        url.indexOf("https:") >= 0 ||
        url.indexOf("ftp:") >= 0)
        return true;

    return false;
}

/**
 * Determine if the filename represents a full path.
 * @params filePath     - the filename [path] string.
 * @return bool         - boolean indicating if the filename represents a full path.
 */
function isFullPath(filePath)
{
    // check for // or \\ in beginning of pathname (UNC filename)
    var unc = false;
    var filePathLen = filePath.length;
    if (filePathLen >= 2)
    {
        if ((filePath[0] == '\\' || filePath[0] == '/') &&
            (filePath[1] == '\\' || filePath[1] == '/'))
        {
            unc = true;
        }
    }       

    // check if file path is a full path
    if (unc || filePath.indexOf(':') >= 0)
    {
        return true;
    }

    return false;
}

/**
 * Form a full path string by appending a filename [path] to a directory path.
 * @params filePath     - the filename [path] string.
 * @params dirPath      - the directory path string.
 * @return string       - the output string.
 */
function formFullPath(filePath, dirPath)
{
    var fullPath = new String();

    if (!filePath || !dirPath)
    {
        return null;
    }      

    // check if file path is already a full path
    if (isFullPath(filePath))
    {
        fullPath = filePath;
    }
    else // file path is relative, formulate full path
    {
        fullPath = dirPath;
        if (fullPath.length > 0)
        {
            var last = fullPath.charAt(fullPath.length - 1);
            if (last != '/' && last != '\\')
            {
                fullPath += '/';
            }
        }
        
        // don't allow "//" in the filepath (Minefield doesn't like that)
        if (filePath[0] == '/' || filePath[0] == "\\")
        {
            fullPath += filePath.slice(1);
        }
        else
        {
            fullPath += filePath;
        }
    }

    return fullPath;
}

function getFileExtension(filename)
{
    var ext = null;
    var lastDot = filename.lastIndexOf(".");
    if (lastDot != -1)
    {
        var ext = "";
        ext = filename.substr(lastDot+1)
        return ext;
    }

    return ext;    
}

function getBrowserName()
{
    var browser = new String(navigator.userAgent);
    
    // chrome
    if (browser.indexOf("Chrome") >= 0) return "Chrome";

    // firefox
    if (browser.indexOf("Firefox") >= 0) return "Firefox";

    return undefined;
}

function OutputDebugMsg(msg)
{
    var innerHTML = document.getElementById("DebugOutput").innerHTML;
    innerHTML += "&gt; " + msg + "<br>";
    document.getElementById("DebugOutput").innerHTML = innerHTML;
}

function addSlashAfterDriveSpecifier(filename)
{
    var index = filename.indexOf(":");
    if (index == -1) return filename;
    
    filename = filename.slice(0, index+1) + "\\" + filename.slice(index+1);
    return filename;
}

function hexStrToULong(string)
{
    // find end of string
    var i = string.length - 1;

    var value = 0;
    var digit = 0;
    var position = 0;
    for ( ; i >= 0; i--, position++)
    {
        switch (string.charAt(i))
        {
        case '0': digit = 0;  break;
        case '1': digit = 1;  break;
        case '2': digit = 2;  break;
        case '3': digit = 3;  break;
        case '4': digit = 4;  break;
        case '5': digit = 5;  break;
        case '6': digit = 6;  break;
        case '7': digit = 7;  break;
        case '8': digit = 8;  break;
        case '9': digit = 9;  break;

        case 'a':
        case 'A': digit = 10; break;

        case 'b':
        case 'B': digit = 11; break;

        case 'c':
        case 'C': digit = 12; break;

        case 'd':
        case 'D': digit = 13; break;

        case 'e':
        case 'E': digit = 14; break;

        case 'f':
        case 'F': digit = 15; break;

        default:  digit = 0;  break;
        }

        value += (digit * Math.pow(16, position));
    }

    return value;
}
