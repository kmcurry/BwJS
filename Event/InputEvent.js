InputEvent.prototype = new Event();
InputEvent.prototype.constructor = InputEvent;

function InputEvent(type, time, inputId, modifiers, state, userData)
{
    Event.call(this, type, time, userData);
    this.className = "InputEvent";
    
    this.inputId = inputId || 0;
    this.modifiers = modifiers || 0;
    this.state = state || 0;
}

InputEvent.prototype.synchronize = function(src)
{
	this.inputId = src.inputId;
	this.modifiers = src.modifiers;
	this.state = src.state;

	Event.prototype.synchronize.call(this, src);
}