SetCommand.prototype = new Command();
SetCommand.prototype.constructor = SetCommand;

function SetCommand()
{
    Command.call(this);
    this.className = "SetCommand";
    
    this.attributeValuePairs = [];
    
    this.target.addModifiedCB(SetCommand_TargetModifiedCB, this);
}

SetCommand.prototype.execute = function()
{
    // TODO: enabled (? - there is a commandEnabled attaribute in .cpp)
    
    this.applyAttributeValues();
}

SetCommand.prototype.applyAttributeValues = function()
{
    for (var i=0; i < this.attributeValuePairs.length; i++)
    {
        setAttributeValue(this.attributeValuePairs[i].first, this.attributeValuePairs[i].second);
    }
}

SetCommand.prototype.registerTargetAttributes = function(target, targetName)
{
    var sname;
    var myAttribute;
    var count = target.getAttributeCount();
    for (var i=0; i < count; i++)
    {
        var attribute = target.getAttributeAt(i);
        var attributeName = target.getAttributeNameAt(i);

        // if the target has an attribute of the same name as the
		// Set, register that same attribute using a relative path
		// expression, e.g., "Container_target"
		if ((myAttribute = this.getAttribute(attributeName)) != null)
		{
			// insert relative path expression
			sName = targetName + "_";	
			sName += attributeName;	
		}
		else	// attribute is not already registered
		{
			sName = attributeName;
		}
		
		this.registerAttribute(attribute, sName);
    }    
}

function SetCommand_TargetModifiedCB(attribute, container)
{ 
    var target = attribute.getValueDirect().join("");
    var targets = target.split(",");
    
    container.targets.length = 0;
    for (var i=0; i < targets.length; i++)
    {
        var resource = container.registry.find(targets[i]);
        if (resource)
        {
            container.registerTargetAttributes(resource, targets[i]);
        }
    }
    
    setAttributeBin(container.attributeValuePairs);
}