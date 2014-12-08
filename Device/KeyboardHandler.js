KeyboardHandler.prototype = new DeviceHandler();
KeyboardHandler.prototype.constructor = KeyboardHandler;

function KeyboardHandler()
{
    DeviceHandler.call(this);
    this.className = "KeyboardHandler";
    this.attrType = eAttrType.KeyboardHandler;
    
    this.name.setValueDirect("KeyboardHandler");
    
    this.keyString = new StringAttr();
    
    this.registerAttribute(this.keyString, "keyString");
}

KeyboardHandler.prototype.eventPerformed = function(event)
{
    
}

