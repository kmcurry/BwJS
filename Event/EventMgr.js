EventMgr.prototype = new AttributeContainer();
EventMgr.prototype.constructor = EventMgr;

function EventMgr()
{
    AttributeContainer.call(this);
    this.className = "EventMgr";
    
    this.listeners = [];
    
    this.name = new StringAttr("EventMgr");
    
    this.registerAttribute(this.name, "name");
}

EventMgr.prototype.addListener = function(type, listener)
{
    if (this.listeners[type] == undefined)
    {
        this.listeners[type] = [];
    }
    
    // only add once
    if (this.listeners[type].indexOf(listener) == -1)
    {
        this.listeners[type].push(listener);
    }
}

EventMgr.prototype.removeListener = function(type, listener)
{
    if (this.listeners[type])
    {
        this.listeners[type].splice(this.listeners[type].indexOf(listener), 1);
    }    
}

EventMgr.prototype.processEvent = function(event)
{
    var type = event.type;
    var expired = [];
    
    // process event for registered listeners
    if (this.listeners[type])
    {
        for (var i=0; i < this.listeners[type].length; i++)
        {
            this.listeners[type][i].eventPerformed(event);
            
            // if listener has finished responding, add to expired list
            if (this.listeners[type][i].getAttribute("numResponses").getValueDirect() == 0)
            {
                expired.push(this.listeners[type][i]);
            }
        }
    }
    
    // remove expired listeners
    for (var i=0; i < expired.length; i++)
    {
        this.removeListener(type, expired[i]);
        this.registry.unregister(expired[i]);
    }
}
EventMgr.prototype.clearEvents = function()
{
/*
    this.bProcessingQs = false;
    this.bPendingRegistrations = false;

    while (!this.pendingAddsQ.empty())
    {
        var elp = m_pendingAddsQ.front();
        var elist = elp.second;
        this.elist.clear();
//        SAFE_DELETE(elist);
        this.pendingAddsQ.pop();
    }

    while (!this.userInputEventsQ.empty())
    {
        var pEvent = this.userInputEventsQ.front();
        this.userInputEventsQ.pop();
//        SAFE_RELEASE(pEvent);
    }

    while (!this.sceneOutputEventsQ.empty())
    {
        var pEvent = this.sceneOutputEventsQ.front();
        this.sceneOutputEventsQ.pop();
//        SAFE_RELEASE(pEvent);
    }

    this.removeAllListeners();
    */
    this.listeners = [];
}