KeyboardEvent.prototype = new InputEvent();
KeyboardEvent.prototype.constructor = KeyboardEvent;

function KeyboardEvent(type, time, buttonId, modifiers, state, userData)
{
    InputEvent.call(this, type, time, buttonId, modifiers, state, userData);
    this.className = "KeyboardEvent";
}