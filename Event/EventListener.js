EventListener.prototype = new Agent();
EventListener.prototype.constructor = EventListener;

function EventListener()
{
    Agent.call(this);
    this.className = "EventListener";
    
    this.events = [];
    
    this.listen = new BooleanAttr(true);
    this.trigger = new StringAttr("");
    this.numResponses = new NumberAttr(1);
    this.event = new StringAttr("");
    
    this.event.addModifiedCB(EventListener_EventModifiedCB, this);
    
    this.registerAttribute(this.listen, "listen");
    this.registerAttribute(this.trigger, "trigger");
    this.registerAttribute(this.numResponses, "numResponses");
    this.registerAttribute(this.event, "event");
}

EventListener.prototype.addEventType = function(type)
{
    this.events.push(type);
}

EventListener.prototype.getEventTypes = function()
{
    return this.events;
}

EventListener.prototype.eventPerformed = function(event)
{
    // decr numResponses
    var numResponses = this.numResponses.getValueDirect();
    if (numResponses > 0)
    {
        this.numResponses.setValueDirect(numResponses-1);
    }
}
EventListener.prototype.getTrigger = function(container)
{
    if(container)
    {
        container = this.trigger;
    }
}
EventListener.prototype.setTrigger = function(container)
{
    if(container)
    {
        this.trigger = container;
    }
}

function EventListener_EventModifiedCB(attribute, container)
{
    var type = getEventTypeByName(attribute.getValueDirect().join(""));
    // TODO -- restore the following line when all events are defined
    //if (type != eEventType.Unknown)
    {
        container.addEventType(type);
    }
}