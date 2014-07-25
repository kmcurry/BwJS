DeviceHandler.prototype = new EventListener();
DeviceHandler.prototype.constructor = DeviceHandler;

function DeviceHandler()
{
    EventListener.call(this);
    this.className = "DeviceHandler";
    this.attrType = eAttrType.DeviceHandler;
    
    this.inputMessage = new NumberAttr(0);
    this.inputId = new NumberAttr(0);
    this.inputModifier = new NumberAttr(0);
    this.inputState = new NumberAttr(0);
    this.prevInputState = new NumberAttr(0);
    this.output = new StringAttr("");
    
    this.registerAttribute(this.inputMessage, "inputMessage");
    this.registerAttribute(this.inputId, "inputId");
    this.registerAttribute(this.inputModifier, "inputModifier");
    this.registerAttribute(this.inputState, "inputState");
    this.registerAttribute(this.prevInputState, "prevInputState");
    this.registerAttribute(this.output, "output");
    
    // always respond to events
    this.numResponses.setValueDirect(-1);
}

DeviceHandler.prototype.eventPerformed = function(event)
{
    this.inputMessage.setValueDirect(event.type);
    this.inputId.setValueDirect(event.inputId);
    this.inputState.setValueDirect(event.state);
    this.inputModifier.setValueDirect(event.modifiers);
}