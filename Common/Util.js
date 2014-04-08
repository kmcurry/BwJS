function loadBinaryResource(url)
{
    var req = new XMLHttpRequest();
    
    req.open('GET', url, false);
    req.overrideMimeType('text/plain; charset=x-user-defined');
    req.send();
    
    if (req.status != 200)
    {
        return null;
    }
    
    return req.responseText;
}

function loadXMLResource(url)
{
    var req = new XMLHttpRequest();
 
    req.open('GET', url, false);
    req.overrideMimeType('text/plain; charset=x-user-defined');    
    req.send();
    
    if (req.status != 200)
    {
        return null;
    }
    
    return req.responseText;
}

function loadTextResource(url)
{
    var req = new XMLHttpRequest();
 
    req.open('GET', url, false);
    req.overrideMimeType('text/plain; charset=x-user-defined');    
    req.send();
    
    if (req.status != 200)
    {
        return null;
    }
    
    return req.responseText;
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
    }

    return undefined;
}

/*  takes string to an absolute or relative URL 
    returns an array containing a valid Bw path
    and the expected content directory.
    DOES NOT ENSURE CONTENT EXISTS
    Treat is like our best guess
*/
function formatPath(url)
{
    var result = [];
    
    var validPath = "";
    var validDir  = "";
    
    try {
        $.ajax({
            url: url,
            type:'HEAD',
            async: false,
            error: function()
            {
                console.debug(url + " does not exist.");
                // could be a relative path
                var href = document.location.href;
                
                validPath = href.substring(0, href.lastIndexOf("/")) + "/bwcontent/" + url;
                
                console.debug("Trying: " + validPath);
                
                var ndx = validPath.lastIndexOf("objects/");
                if (ndx == -1) ndx = validPath.lastIndexOf("motions/");
                if (ndx == -1) ndx = validPath.lastIndexOf("envelopes/");
                if (ndx == -1) ndx = validPath.lastIndexOf("scenes/");
                
                validDir = validPath.substring(0, ndx);
                
                console.debug("With contentDir: " + validDir);  
            },
            success: function()
            {
                validPath = url;
                
                var ndx = validPath.lastIndexOf("objects/");
                if (ndx == -1) ndx = validPath.lastIndexOf("motions/");
                if (ndx == -1) ndx = validPath.lastIndexOf("envelopes/");
                if (ndx == -1) ndx = validPath.lastIndexOf("scenes/");
                
                validDir = validPath.substring(0, ndx);
                
                console.debug("File found: " + validPath);
            }
        });
        
        result[0] = validPath;
        result[1] = validDir;
    } catch (e) {
        
    }
    
    return result;
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