Event.prototype = new AttributeContainer();
Event.prototype.constructor = Event;

function Event(type, time, userData)
{
    AttributeContainer.call(this);
    this.className = "Event";
    
    this.type = type || eEventType.Unknown;
    this.time = time || 0;
    this.userData = userData || null;
}

Event.prototype.synchronize = function(src)
{
    this.type = src.type;
    this.time = src.time;
    this.userData = src.userData;
}