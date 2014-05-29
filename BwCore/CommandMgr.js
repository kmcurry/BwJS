CommandMgr.prototype = new AttributeContainer();
CommandMgr.prototype.constructor = CommandMgr;

function CommandMgr()
{
    AttributeContainer.call(this);
    this.className = "CommandMgr";
    
    this.sequenceStack = new Stack();
    
    this.name = new StringAttr("CommandMgr");
    
    this.registerAttribute(this.name, "name");
}

CommandMgr.prototype.pushCommandSequence = function(sequence)
{
    this.sequenceStack.push(sequence);
}

CommandMgr.prototype.popCommandSequence = function()
{
    this.sequenceStack.pop();
}

CommandMgr.prototype.clearCommandSequence = function()
{
    this.sequenceStack.clear();
}

CommandMgr.prototype.addCommand = function(command)
{
    if (this.sequenceStack.length > 0)
    {
        this.sequenceStack.top().addCommand(command);
        return;
    }
    
    // execute the command or register it for events.  If the command
    // was NOT configured for events, then Execute it and get rid of it             
    var events = command.getEventTypes();
    var trigger = command.getAttribute("trigger");
    if (events.length > 0)
    {
        var eventMgr = this.registry.find("EventMgr");
        if (eventMgr)
        {
            for (var i=0; i < events.length; i++)
            {
                eventMgr.addListener(events[i], command);
            }
        }   
    }
    else if (trigger.getLength() > 0)
    {
        // TODO
        console.debug("TODO: ");
    }
    else // no events -- execute and remove
    {
        command.execute();
        this.registry.unregister(command);
    }
    
    setAttributeBin(null);
}

CommandMgr.prototype.createCommandTrigger = function(command, trigger) 
 {

 	// TODO: Support Commands that Execute from Events AND Triggers

 	// trigger syntax based on Attributes:
 	// ObjectName/Attribute=value
 	// ObjectName/Attribute[item]=value
 	// ObjectName/Attribute=value,value,value,...,value
 	// Where "ObjectName" may be an XPath-like expression
 	var attrNdx = 0;
    var valueNdx = 0;
    var rangeNdx = 0;
    var itemNdx = 0;

 	attrNdx = trigger.lastIndexOf('/');
 	if (attrNdx != -1)
 	{
 		
 		var objectName = trigger.substringing(0, attrNdx);
 		var resource = bridgeworks.registry.find(objectName);

 		if(resource)
 		{
 			var not = false;
            
            var objectName = "";
            var attrName = "";
            var itemString = "";
            var valueString = "";
            var rangeString = "";
            
 			valueNdx = trigger.lastIndexOf('!'); 
 			if (valueNdx > 0)
 			{
 			    trigger.erase(valueNdx, 1); // erase the '!' for subsequent processing
 			    not = true;
 			}

 			valueNdx = trigger.lastIndexOf('=');
 			if(valueNdx > 0) 
 			{
 				itemNdx = trigger.lastIndexOf('['); 
 				if(itemNdx > 0) 
 				{
 					var itemNdx2 = trigger.lastIndexOf(']', itemNdx); 
 					itemString = trigger.substring(itemNdx+1, itemNdx2 - itemNdx - 1); 
 				}

 				var range = FLT_MAX; 
 				rangeNdx = trigger.lastIndexOf(',');
 				if(rangeNdx > 0)
 				{
 					var rangeString = trigger.substring(rangeNdx+1, trigger.length()-rangeNdx-1);
 					range = rangeString.parseFloat(); 
 				}
 				rangeNdx = rangeNdx == -1 ? trigger.length() : rangeNdx;

 				// value is the string between '=' && (',' || end of string)
 				value = trigger.substring(valueNdx+1, rangeNdx-valueNdx);
 			}
 			else //TEMPEST
 			{
 				itemNdx = trigger.lastIndexOf('[');
 				if(itemNdx > 0) 
 				{
 					var itemNdx2 = trigger.lastIndexOf(']', itemNdx);
 					itemString = trigger.substring(itemNdx+1, itemNdx2-itemNdx-1);
 				}
 			}
 			valueNdx = itemNdx == -1 ? (valueNdx == -1 ? trigger.length() : valueNdx) : itemNdx;
 			attrName = trigger.substring(attrNdx+1, valueNdx-attrNdx-1);

 			var input = target.getAttribute(attrName);

 			var trigger = createAttribute(input, valueString);

 			if(trigger)
 			{
 				var item = -1; 
 				if(itemString != "")
 				{
 					item = itemString.parseInt(); 
 				}
 				var numExecutions = command.getNumResponses();
 				var trigger = new AttributeTrigger(input, trigger, command, item, not, numExecutions);

 				if(!trigger) return;
 				command.setTrigger(trigger); 
 			}
 			trigger = objectName + "/" + attrName;

 			console.debug(trigger);
 			console.debug("\n");
 		}		
 	}
 }

CommandMgr.prototype.createAttribute = function(attribute, value)
{
	var newAttribute = null;
	if(attribute)
	{
		var etype = attribute.attrElemType;
		var len = attribute.getLength();

			switch (etype)
			{
			case eAttrElemType_Int:
				{
					newAttribute = new NumberAttr();
		            newAttribute.setValueDirect(valueString.parseInt());
				}
				break;
			case eAttrElemType_UnsignedInt:
				{
					newAttribute = new NumberAttr();
		            newAttribute.setValueDirect(valueString.parseInt());
				}
				break;
			case eAttrElemType_Char:
				{
					newAttribute = new StringAttr();
                    newAttribute.setValueDirect(valueString);
				}
				break;
			case eAttrElemType_UnsignedChar:
				{
			    }
				break;
			case eAttrElemType_Float:
            case eAttrElemType_Double:
				{
					newAttribute = new NumberAttr();
		            newAttribute.setValueDirect(valueString.parseFloat());
				}
				break;
			default:
				newAttribute = null;
				break;
			}
		  }
		return newAttribute; 
}
