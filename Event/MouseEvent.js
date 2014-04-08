var MOUSEEVENT_LEFT_BUTTON     = 0x0001;
var MOUSEEVENT_MIDDLE_BUTTON   = 0x0002;
var MOUSEEVENT_RIGHT_BUTTON    = 0x0004;

MouseEvent.prototype = new InputEvent();
MouseEvent.prototype.constructor = MouseEvent;

function MouseEvent(type, time, buttonId, modifiers, state, x, y, userData)
{
    InputEvent.call(this, type, time, buttonId, modifiers, state, userData);
    this.className = "MouseEvent";
    
    this.x = x || 0;
    this.y = y || 0;
}