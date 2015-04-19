function MouseEventState()
{
    this.leftButtonDown = false;
    this.middleButtonDown = false;
    this.rightButtonDown = false;
}

EventAdapter.prototype = new AttributeContainer();
EventAdapter.prototype.constructor = EventAdapter;

function EventAdapter()
{
    AttributeContainer.call(this);
    this.className = "EventAdapter";
    
    this.mouseState = new MouseEventState();
    
    this.name = new StringAttr("EventAdapter");
    
    this.registerAttribute(this.name, "name");
}

EventAdapter.prototype.createKeyboardEvent = function(event, eventType /* optional; used for "keyup" */)
{
    var date = new Date();
    
    var type = eEventType.Unknown;
    var time = date.getTime();
    var buttonId = event.keyCode;
    var modifiers = 0;  // TODO
    var state = 0;      // TODO
    
    var eventType = eventType || event.type;
    switch (eventType)
    {
        case "keydown":
            {
                type = eEventType.KeyDown_First + buttonId;
            }
            break;
            
        case "keypress":
            {
                type = eEventType.KeyDown_First + buttonId - 32; //  not sure why keycodes have +32 compared to keydown events
            }
            break;
            
        case "keyup":
            {
                type = eEventType.KeyUp_First + buttonId;
            }
            break;
    }
    
    var keyboardEvent = new KeyboardEvent(type, time, buttonId, modifiers, state);
    
    return keyboardEvent;
}

EventAdapter.prototype.createMouseEvent = function(event)
{
    var date = new Date();
    
    var type = eEventType.Unknown;
    var time = date.getTime();
    var buttonId = 0;
    var modifiers = 0;  // TODO
    var state = 0;      // TODO
    
    var x = event.canvasX;
    var y = event.canvasY;

    switch (event.type)
    {
    case "click":
        {
            switch (event.button)
            {
            case 0: type = eEventType.MouseLeftClick; break;
            case 1: type = eEventType.MouseMiddleDown; break;
            case 2: type = eEventType.MouseRightClick; break;
            } 
        }
        break;

    case "dblclick":
        {
            switch (event.button)
            {
            case 0: type = eEventType.MouseLeftDblClick; break;
            case 1: type = eEventType.MouseMiddleDblClick; break;
            case 2: type = eEventType.MouseRightDblClick; break;
            }    
        }
        break;
        
    case "mousedown":
        {
            switch (event.button)
            {
            case 0:
                { 
                    if (this.mouseState.rightButtonDown)
                    {
                        type = eEventType.MouseBothDown;
                    }
                    else 
                    {
                        type = eEventType.MouseLeftDown;
                    }
                    this.mouseState.leftButtonDown = true;
                }
                break;
                
            case 1: 
                {
                    type = eEventType.MouseMiddleDown;
                    this.mouseState.middleButtonDown = true;
                }
                break;
                
            case 2: 
                {
                    if (this.mouseState.leftButtonDown)
                    {
                        type = eEventType.MouseBothDown;
                    }
                    else 
                    {
                        type = eEventType.MouseRightDown;
                    }
                    this.mouseState.rightButtonDown = true;
                }
                break;
            }
        }
        break;
      
    case "mouseup":
        {
            switch (event.button)
            {
            case 0:
                { 
                    type = eEventType.MouseLeftUp; 
                    this.mouseState.leftButtonDown = false;
                }
                break;
                
            case 1: 
                {
                    type = eEventType.MouseMiddleUp;
                    this.mouseState.middleButtonDown = false;
                }
                break;
                
            case 2: 
                {
                    type = eEventType.MouseRightUp;
                    this.mouseState.rightButtonDown = false;
                }
                break;
            }
        }
        break;
        
    case "mousemove":
        {
            type = eEventType.MouseMove;
        }
        break;
        
        case "mousewheel":
        {
            type = eEventType.MouseWheelBackward;
        }
        break;

    default:
        {
            type = eEventType.UserDefined; // TEMPTEST (?)
        }
        break;
    }       
    
    // set which buttons are pressed to buttonId
    if (this.mouseState.leftButtonDown)     buttonId |= MOUSEEVENT_LEFT_BUTTON;
    if (this.mouseState.middleButtonDown)   buttonId |= MOUSEEVENT_MIDDLE_BUTTON;
    if (this.mouseState.rightButtonDown)    buttonId |= MOUSEEVENT_RIGHT_BUTTON;
    
    var mouseEvent = new MouseEvent(type, time, buttonId, modifiers, state, x, y);
    
    return mouseEvent;
}