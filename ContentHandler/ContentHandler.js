ContentHandler.prototype = new AttributeContainer();
ContentHandler.prototype.constructor = ContentHandler;

function ContentHandler()
{
    AttributeContainer.call(this);
    this.className = "ContentHandler";
    
    this.contentDirectory = new StringAttr("");
    this.url = new StringAttr("");
    
    this.registerAttribute(this.contentDirectory, "contentDirectory");
    this.registerAttribute(this.url, "url");
}

ContentHandler.prototype.parseFileStream = function(file)
{
}

ContentHandler.prototype.matchesType = function(type)
{
}
