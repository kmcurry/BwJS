LWSceneHandler.prototype = new ContentHandler();
LWSceneHandler.prototype.constructor = LWSceneHandler;

function LWSceneHandler()
{
    ContentHandler.call(this);
    this.className = "LWSceneHandler";
    
    this.tokenHandlers = [];
    this.tokenHandlersData = [];
}

LWSceneHandler.prototype.addTokenHandler = function(handler, data)
{
    this.tokenHandlers.push(handler);
    this.tokenHandlersData.push(data);
}

LWSceneHandler.prototype.parseFileStream = function(url)
{
    var filename = formFullPath(url, this.contentDirectory.getValueDirect().join(""));
    var filestream = loadTextResource(filename);
    if (filestream == null)
    {
        return -2;
    }
    
    var parser = new TextParser(filestream);
    
    var tokens;
    while (tokens = parser.readLineTokens())
    {
        // pass tokens to consumer(s)
        for (var i=0; i < this.tokenHandlers.length; i++)
        {
            this.tokenHandlers[i](tokens, this.tokenHandlersData[i]);    
        }    
    }
}