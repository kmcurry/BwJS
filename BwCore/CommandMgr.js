CommandMgr.prototype = new AttributeContainer();
CommandMgr.prototype.constructor = CommandMgr;

function CommandMgr()
{
    AttributeContainer.call(this);
    this.className = "CommandMgr";
    
    this.sequenceStack = new Stack();
    
    this.name = new StringAttr("CommandMgr");
    
    this.registerAttribute(this.name, "name");
}

CommandMgr.prototype.pushCommandSequence = function(sequence)
{
    this.sequenceStack.push(sequence);
}

CommandMgr.prototype.popCommandSequence = function()
{
    this.sequenceStack.pop();
}

CommandMgr.prototype.clearCommandSequence = function()
{
    this.sequenceStack.clear();
}

CommandMgr.prototype.addCommand = function(command)
{
    if (this.sequenceStack.length > 0)
    {
        this.sequenceStack.top().addCommand(command);
        return;
    }
    
    // execute the command or register it for events.  If the command
    // was NOT configured for events, then Execute it and get rid of it             
    var events = command.getEventTypes();
    var trigger = command.getAttribute("trigger");
    if (events.length > 0)
    {
        var eventMgr = this.registry.find("EventMgr");
        if (eventMgr)
        {
            for (var i=0; i < events.length; i++)
            {
                eventMgr.addListener(events[i], command);
            }
        }   
    }
    else if (trigger.getLength() > 0)
    {
        // TODO
        console.debug("TODO: ");
    }
    else // no events -- execute and remove
    {
        command.execute();
        this.registry.unregister(command);
    }
    
    setAttributeBin(null);
}