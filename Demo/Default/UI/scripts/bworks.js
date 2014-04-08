//==============Bridgeworks Web API=================//
// 		Acts as an interface for web elements
// 		to interact with a Bridgeworks scene
//==================================================//

/**
	Interface object for communicating with Bridgeworks
	@example: var BWexample = new BridgeWorksObject();
*/	
function BridgeWorksObject()
{

}


function createObject(scene, width, height)
{
    var threadModel = 0; // single-thread (initially)
    
    var browser = navigator.appName;
    
    if (browser.indexOf("Netscape") != -1 ||
        browser.indexOf("Opera") != -1)
    {
        document.write('<object id="Bridgeworks" type="application/bridgeworks"');
        document.write(' width="' + width + '"');
        document.write(' height="' + height + '"');
        document.write(' scene="' + scene + '"');
        document.write(' threadmodel="' + threadModel + '"');
        document.write('/>');
    }
    else if (browser.indexOf("Microsoft") != -1)
    {
        document.write('<OBJECT ID="Bridgeworks" CLASSID="CLSID:3E1A7D52-C16E-4E94-AF5F-E6C1759F736B" CODEBASE="http://dev.bridgeborn.com/Bridgeworks/bin/Bridgeworks250158.exe">');
        document.write('<PARAM NAME="width" VALUE="' + width + '">')
        document.write('<PARAM NAME="height" VALUE="' + height + '">')
        document.write('<PARAM NAME="scene" VALUE="' + scene + '">')
        document.write('<PARAM NAME="threadmodel" VALUE="' + threadModel + '">')
        document.write('</OBJECT>')
    }

}


