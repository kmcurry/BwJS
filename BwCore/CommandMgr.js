CommandMgr.prototype = new AttributeContainer();
CommandMgr.prototype.constructor = CommandMgr;

function CommandMgr()
{
    AttributeContainer.call(this);
    this.className = "CommandMgr";
    
    this.commandSeqStack = new Stack();
    
    this.name = new StringAttr("CommandMgr");
    
    this.registerAttribute(this.name, "name");
}

CommandMgr.prototype.pushCommandSequence = function(sequence)
{
    this.commandSeqStack.push(sequence);
}

CommandMgr.prototype.popCommandSequence = function()
{
    this.commandSeqStack.pop();
}

CommandMgr.prototype.clearCommandSequenceStack = function()
{
    this.commandSeqStack.clear();
}

CommandMgr.prototype.addCommand = function(command)
{
    setAttributeBin(null);
    setAttributePairs(null);
    
    if (this.commandSeqStack.length() > 0)
    {
        this.commandSeqStack.top().addCommand(command);
        this.registry.unregister(command); // unregister here so command will not be serialized separately
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
		trigger.addModifiedCB(CommandMgr_CommandTriggerModifiedCB, this);
		this.createCommandTrigger(command, trigger);
    }
    else // no events -- execute and remove
    {
        command.execute();
        this.registry.unregister(command);
    }
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

    var triggerString = "";
    triggerString = trigger.getValueDirect().join("");
 	attrNdx = triggerString.lastIndexOf('/');

 	if (attrNdx != -1)
 	{
 		var objectName = triggerString.substring(0, attrNdx);
 		var resource = bridgeworks.registry.find(objectName);
 		if(resource)
 		{
 			var not = false;

            var attrName = "";
            var itemString = "";
            var valueString = "";
            var rangeString = "";
            
 			valueNdx = triggerString.lastIndexOf('!');
 			if (valueNdx > 0)
 			{
 			    triggerString.replace("!", ""); // erase the '!' for subsequent processing
 			    not = true;
 			}

 			valueNdx = triggerString.lastIndexOf('=');

 			if(valueNdx > 0) 
 			{
 				itemNdx = triggerString.lastIndexOf('[');
 				if(itemNdx > 0) 
 				{
 					var itemNdx2 = triggerString.lastIndexOf(']', itemNdx); 
 					itemString = triggerString.substring(itemNdx+1, itemNdx2 - itemNdx - 1); 
 				}

 				var range = FLT_MAX; 
 				var rangeNdx = triggerString.lastIndexOf(',');
 				if(rangeNdx > 0)
 				{
 					var rangeString = triggerString.substring(rangeNdx+1, trigger.length()-rangeNdx-1);
 					range = rangeString.parseFloat(); 
 				}
 				rangeNdx = rangeNdx == -1 ? triggerString.length : rangeNdx;
 				// value is the string between '=' && (',' || end of string)
 				valueString = triggerString.substring(valueNdx+1, valueNdx+(rangeNdx-valueNdx));

 			}
 			else //TEMPEST
 			{
 				itemNdx = triggerString.lastIndexOf('[');
 				if(itemNdx > 0) 
 				{
 					var itemNdx2 = triggerString.lastIndexOf(']', itemNdx);
 					itemString = triggerString.substring(itemNdx+1, itemNdx2-itemNdx-1);
 				}
 			}
 			valueNdx = itemNdx == -1 ? (valueNdx == -1 ? triggerString.length() : valueNdx) : itemNdx;
 			attrName = triggerString.substring(attrNdx+1, valueNdx);

 			var input = resource.getAttribute(attrName);

 			var attr = this.createAttribute(input, valueString);

 			if(attr)
 			{
 				var item = -1; 
 				if(itemString != "")
 				{
 					item = parseInt(itemString);
 				}

 				var numExecutions = command.numResponses;
 				var newTrigger = new AttributeTrigger(input, attr, command, item, not, numExecutions);

 				command.setTrigger(newTrigger);
 			}
 			triggerString = objectName + "/" + attrName;

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
        //console.debug(attribute);
		var etype = attribute.attrType;
		var len = attribute.getLength();
        //console.debug(etype);
//			switch (etype)
//			{
//
//			case eAttrType.BooleanAttr:
//				{
//					newAttribute = new NumberAttr();
//		            newAttribute.setValueDirect(parseInt(value));
//				}
//				break;
//            case eAttrType.NumberAttr:
//
//				{
					newAttribute = new NumberAttr();
		            newAttribute.setValueDirect(parseFloat(value));
//				}
//				break;
//
//            case eAttrType.StringAttr:
//				{
//					newAttribute = new StringAttr();
//                    newAttribute.setValueDirect(value);
//				}
//				break;
//
//			default:
//				newAttribute = null;
//				break;
//			}
		  }
        //console.debug(newAttribute);
		return newAttribute; 
}

function CommandMgr_CommandTriggerModifiedCB(attribute, container)
{
	this.createCommandTrigger(attribute, container);
}
