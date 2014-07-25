MouseHandler.prototype = new DeviceHandler();
MouseHandler.prototype.constructor = MouseHandler;

function MouseHandler()
{
    DeviceHandler.call(this);
    this.className = "MouseHandler";
    this.attrType = eAttrType.MouseHandler;
    
    this.name.setValueDirect("MouseHandler");
        
    this.lastX = 0;
    this.lastY = 0;
    
    this.x = new NumberAttr(0);
    this.y = new NumberAttr(0);
    this.deltaX = new NumberAttr(0);
    this.deltaY = new NumberAttr(0);
    this.delta = new Vector2DAttr(0, 0);
    
    this.registerAttribute(this.x, "deviceX");
    this.registerAttribute(this.y, "deviceY");
    this.registerAttribute(this.deltaX, "deltaX");
    this.registerAttribute(this.deltaY, "deltaY");
    this.registerAttribute(this.delta, "delta");
   
    this.addEventType(eEventType.MouseMove);
    this.addEventType(eEventType.MouseLeftDown);
}

MouseHandler.prototype.eventPerformed = function(event)
{
    var x = event.x;
    var y = event.y;

    switch (event.type)
    {
    	case eEventType.MouseMove:
    	{
			// do nothing
    	}
    	break;
    	
    	default:
    	{
    		this.lastX = x;
    		this.lastY = y;
    	}
    	break;
    }
   
    this.x.setValueDirect(x);
    this.y.setValueDirect(y);
    
    this.deltaX.setValueDirect(this.lastX-x);
    this.deltaY.setValueDirect(this.lastY-y);
    
    this.delta.setValueDirect(this.lastX-x, this.lastY-y);
    
    this.lastX = x;
    this.lastY = y;
    
    // call the base class to copy the rest of the InputEvent data
	DeviceHandler.prototype.eventPerformed.call(this, event);

	this.deltaX.setValueDirect(0);
	this.deltaY.setValueDirect(0);
	this.delta.setValueDirect(0, 0);
}