RasterComponentEventListener.prototype = new EventListener();
RasterComponentEventListener.prototype.constructor = Command;

function RasterComponentEventListener()
{
    EventListener.call(this);
    this.className = "RasterComponentEventListener";

    this.rcs = [];
    this.rcsSelectionState = [];
    this.rcListenMap = [];
    this.rcEventMap = [];
    this.styleMgr = null;
    
    this.selectionEvent = new InputEvent(eEventType.Unknown, 0, 0xffffffff, 0, eEventType.Key_Up);

	this.name.setValueDirect("RasterComponentEventListener");
	this.numResponses.setValueDirect(-1);
}

RasterComponentEventListener.prototype.eventPerformed = function(event)
{
    var enabled = this.enabled.getValueDirect();
    if (!enabled)
    {
        return;
    }
    
    var currSelectionState, lastSelectionState, selectionEventSelectionState;
	for (var i=0; i < this.rcs.length; i++)
	{
		if (!this.isListening(this.rcs[i]))
		{
			continue;
		}

		lastSelectionState = this.rcsSelectionState[i];
		currSelectionState = this.rcs[i].eventPerformed(event);
		
		if (this.styleMgr)
	    {
		    if (currSelectionState)
			{
				this.styleMgr.eventPerformed(event, this.rcs[i]);

				// send selected/focus/mouseover event depending upon event type and whether 
				// component doesn't have focus/didn't have selection
				switch (event.type)
				{
				case eEventType.MouseLeftClick:
					{
						// send element focus event (once)
						if (this.isListeningEvent(this.rcs[i], eEventType.ElementFocus) &&
							this.rcs[i].hasFocus.getValueDirect() <= 0)
						{
							this.selectionEvent.synchronize(event);
							this.selectionEvent.type = eEventType.ElementFocus;
							
							selectionEventSelectionState = m_rcs[i].eventPerformed(this.selectionEvent);
							this.styleMgr.eventPerformed(this.selectionEvent, this.rcs[i]);

							this.rcs[i].hasFocus.setValueDirect(1);
					    }
					}
					break;

				case eEventType.MouseMove:
					{
						// send element selected event (once)
						if (this.isListeningEvent(this.rcs[i], eEventType.ElementSelected) &&
							this.rcs[i].selected.getValueDirect() <= 0)
						{
							this.selectionEvent.synchronize(event);
							this.selectionEvent.type = eEventType.ElementSelected;
							
							selectionEventSelectionState = this.rcs[i].eventPerformed(this.selectionEvent);
							this.styleMgr.eventPerformed(this.selectionEvent, this.rcs[i]);
							this.rcs[i].selected.setValueDirect(1);
						}

						if (!lastSelectionState &&
							this.isListeningEvent(this.rcs[i], eEventType.MouseOver))
						{
							this.selectionEvent.synchronize(event);
							this.selectionEvent.type = eEventType.MouseOver;

							selectionEventSelectionState = this.rcs[i].eventPerformed(this.selectionEvent);
							this.styleMgr.eventPerformed(this.selectionEvent, this.rcs[i]);
						}
					}
					break;
				}
			}
			else // !currSelectionState
			{
				// send unselected/blur/mouseout event depending upon event type and whether 
				// component has focus/had selection
				switch (event.type)
				{
				case eEventType.MouseLeftDown:
				case eEventType.MouseLeftClick:
				case eEventType.MouseLeftDblClick:
				case eEventType.MouseMiddleDown:
				case eEventType.MouseMiddleClick:
				case eEventType.MouseMiddleDblClick:
				case eEventType.MouseRightDown:
				case eEventType.MouseRightClick:
				case eEventType.MouseRightDblClick:
				case eEventType.MouseWheelDown:
				case eEventType.MouseBothDown:
					{
						// send element blur event (once)
						if (this.isListeningEvent(this.rcs[i], eEventType.ElementBlur) &&
							this.rcs[i].hasFocus.getValueDirect() > 0)
						{
							this.selectionEvent.synchronize(event);
							this.selectionEvent.type = eEventType.ElementBlur;
							
							selectionEventSelectionState = this.rcs[i].eventPerformed(this.selectionEvent);
							this.styleMgr.eventPerformed(this.selectionEvent, this.rcs[i]);

							this.rcs[i].hasFocus.setValueDirect(-1);
						}
					}
					break;

				case eEventType.MouseMove:
					{
						// send element unselected event (once)
						if (this.isListeningEvent(this.rcs[i], eEventType.ElementUnselected) &&
							this.rcs[i].selected.getValueDirect() > 0)
						{
							this.selectionEvent.synchronize(event);
							this.selectionEvent.type = eEventType.ElementUnselected;
							
							selectionEventSelectionState = this.rcs[i].eventPerformed(this.selectionEvent);
							this.styleMgr.eventPerformed(this.selectionEvent, this.rcs[i]);
							this.rcs[i].selected.setValueDirect(-1);
						}

						if (lastSelectionState &&
							this.isListeningEvent(this.rcs[i], eEventType.MouseOut))
						{
							this.selectionEvent.synchronize(event);
							this.selectionEvent.type = eEventType.MouseOut;

							selectionEventSelectionState = this.rcs[i].eventPerformed(this.selectionEvent);
							this.styleMgr.eventPerformed(this.selectionEvent, this.rcs[i]);
						}
					}
					break;
				}
			}
		}

		this.rcsSelectionState[i] = currSelectionState;
	}
}

RasterComponentEventListener.prototype.registerComponent = function(rc, before)
{
    if (rc)
    {
        if (before)
        {
            var i = this.rcs.indexOf(before);
            if (i < 0) i = this.rcs.length;
            
            this.rcs.splice(i, 0, rc);
            this.rcsSelectionState.splice(i, 0, rc);
        }
        else
        {
            this.rcs.push(rc);
            this.rcsSelectionState.push(rc);
        }
    }
}

RasterComponentEventListener.prototype.unregisterComponent = function(rc)
{
    if (rc)
    {
        this.rcs.splice(this.rcs.indexOf(rc), 1);
    }
}

RasterComponentEventListener.prototype.Listen = function(rc)
{
    if (rc)
    {
        this.rcListenMap[rc] = true;
    }
}

RasterComponentEventListener.prototype.Ignore = function(rc)
{
    if (rc)
    {
        this.rcListenMap[rc] = false;
    }
}

RasterComponentEventListener.prototype.listenEvent = function(rc, eventType)
{
    if (rc)
    {
        if (this.rcEventMap[rc] == undefined)
        {
            this.rcEventMap[rc] = new Array();
        }

        this.rcEventMap[rc].push(eventType);
    }
}

RasterComponentEventListener.prototype.ignoreEvent = function(rc, eventType)
{
    if (rc)
    {
        if (this.rcEventMap[rc])
        {
            this.rcEventMap[rc].splice(this.rcEventMap[rc].indexOf(eventType), 1);
        }
    }
}

RasterComponentEventListener.prototype.setStyleMgr = function(styleMgr)
{
    this.styleMgr = styleMgr;
}

RasterComponentEventListener.prototype.setSelectionState = function(rc, selected)
{
    this.rcsSelectionState[rc] = selected;
}

RasterComponentEventListener.prototype.getComponent = function(n)
{
    if (n < this.rcs.length)
    {
        return this.rcs[n];
    }

    return null;
}

RasterComponentEventListener.prototype.isListening = function(rc)
{
    if (rc)
    {
        if (this.rcListenMap[rc])
        {
            return this.rcListenMap[rc];
        }
    }

    return false;
}

RasterComponentEventListener.prototype.isListeningEvent = function(rc, eventType)
{
    if (rc)
    {
        if (this.rcEventMap[rc])
        {
            if (this.rcEventMap[rc].indexOf(eventType) >= 0)
                return true;
        }
    }

    return false;
}

