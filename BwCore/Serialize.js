SerializeCommand.prototype = new Command();
SerializeCommand.prototype.constructor = SerializeCommand();


function SerializeCommand()
{
    Command.call(this);
    this.className = "SerializeCommand";
    
    this.targetResource = null;
    
    this.target.addModifiedCB(SerializeCommand_TargetModifiedCB, this);
}

SerializeCommand.prototype.execute = function()
{
	if (this.directive)
    {
	    if (this.targetResource)
	    {
            if (this.directive.execute(this.targetResource) == 0)
            {
                this.serialized = this.directive.getSerialized();
                console.debug(this.serialized);
            }
	    }
        else // !this.target
        {
            serializeScene();
        }
    }

	return;
}

SerializeCommand.prototype.serializeScene = function()
{
    var i = 0;
    var container = null;
    var node = null;
    //TContext context;

    // root element open tag
    this.serialized = "<Session broadcast='false'>";

    if (this.registry)
    {

    }

    // root element close tag
    this.serialized += "</Session>";

    return;
}

function SerializeCommand_TargetModifiedCB(attribute, container)
{
    var target = attribute.getValueDirect().join("");
    var resource = container.registry.find(target);
    if (resource)
    {
        container.targetResource = resource;
    }
}