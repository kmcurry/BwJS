Command.prototype = new EventListener();
Command.prototype.constructor = Command;

function Command()
{
    EventListener.call(this);
    this.className = "Command";
    this.attrType = eAttrType.Command;
    
    this.target = new StringAttr("");
    
    this.registerAttribute(this.target, "target");
}

Command.prototype.eventPerformed = function(event)
{
    if (this.listen.getValueDirect() == true)
    {
        this.execute();
    }
    
    // call base-class implementation
    EventListener.prototype.eventPerformed.call(this, event);
}
