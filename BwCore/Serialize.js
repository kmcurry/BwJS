SerializeCommand.prototype = new Command();
SerializeCommand.prototype.constructor = SerializeCommand;

function SerializeCommand()
{
    Command.call(this);
    this.className = "Serialize";
    this.attrType = eAttrType.Serialize;

    this.targetAttribute = null;
    this.target.addModifiedCB(SerializeCommand_TargetModifiedCB, this);
    this.directive = null;
    this.serialized = "";
}

SerializeCommand.prototype.execute = function()
{
    if (this.directive)
    {
//        if (this.target && this.directive)
//        {
//            if (this.directive.execute(this.target === 0))
//            {
//                this.serialized = this.directive.getSerialized();
//            }
//        }
//        else // !this.target
//        {
            this.serializeScene();
//        }
    }
}

SerializeCommand.prototype.serializeScene = function()
{
    var i;
    var container = null;
    var node = null;
    var context = new Context();
    var xstr;

    // root element open tag
    this.serialized = '<?xml version="1.0" encoding="UTF-8"?><?bw onload="initialize"?><Session broadcast="false">';

    //var attrContainerRegistry = this.registry.getAttributeContainerRegistry();
    var attrContainerRegistry = bridgeworks.registry;
    if (attrContainerRegistry)
    {
        var factory = this.registry.find("AttributeFactory");
        var serializer = factory.create("Serializer");
        var xmlSerializer = new XMLSerializer(); 
        // set minimum flag so that only the minimum required for recreation is serialized
        serializer.serializeMinimum.setValueDirect(true);

        var count = attrContainerRegistry.getObjectCount();

        // serialize
        var i;
        for (i = 0; i < count; i++)
        {
            container = attrContainerRegistry.getObject(i);
            if (!container) continue;
            
            // device handlers
            if (container.attrType > eAttrType.DeviceHandler && 
                container.attrType < eAttrType.DeviceHandler_End)
            {
                context.attribute = container;

                // serialize
                serializer.serialize(context.attribute, context.item, context.attributeName, context.container);
                var serialized = xmlSerializer.serializeToString(serializer.DOM);
                if (serialized == "<__InitialRoot/>") continue;
                this.serialized += serialized;
            }
            // root nodes (nodes without parents)
            else if (container.attrType > eAttrType.Node && 
                	 container.attrType < eAttrType.Node_End)
            {
            	if (container.getParentCount() == 0)
            	{
                	this.directive.execute(container);
                	this.serialized += this.directive.serialized;
                }
            }
            // directives
            else if (container.attrType > eAttrType.Directive &&
            		 container.attrType < eAttrType.Directive_End)
            {
            	context.attribute = container;

                // serialize
                serializer.serialize(context.attribute, context.item, context.attributeName, context.container);
                var serialized = xmlSerializer.serializeToString(serializer.DOM);
                if (serialized == "<__InitialRoot/>") continue;
                this.serialized += serialized;
            }
            // SelectionListener
            else if (container.className == "SelectionListener")
            {
                var computePivotDistance = container.getAttribute("computePivotDistance").getValueDirect();

                this.serialized += "<Set target=\"Selector\" computePivotDistance=\"";
                this.serialized += (computePivotDistance ? "true" : "false");
                this.serialized += "\"/>";
            }
            // remaining attributes not fitting other criteria and not a command (commands serialized below)
            /*else if (container.attrType < eAttrType.Command || 
                	 container.attrType > eAttrType.Command_End)
            {
                context.attribute = container;

                // serialize
                serializer.serialize(context.attribute, context.item, context.attributeName, context.container);
                this.serialized += xmlSerializer.serializeToString(serializer.DOM);
            }*/
        }

		// commands

		// DisconnectAttributes commands (must come before ConnectAttributes in DefaultPreferences.xml)
		for (i = 0; i < count; i++)
        {
            container = attrContainerRegistry.getObject(i);
            if (!container) continue;
            
   			if (container.className == "DisconnectAttributes")
            {
                context.attribute = container;

                // serialize
                serializer.serialize(context.attribute, context.item, context.attributeName, context.container);
                var serialized = xmlSerializer.serializeToString(serializer.DOM);
                if (serialized == "<__InitialRoot/>") continue;
                this.serialized += serialized;
            }
        }
        
        // other commands
        for (i = 0; i < count; i++)
        {
            container = attrContainerRegistry.getObject(i);
            if (!container) continue;
            
   			if (container.attrType > eAttrType.Command && 
                container.attrType < eAttrType.Command_End &&
                container.className != "DisconnectAttributes")
            {
                context.attribute = container;

                // serialize
                serializer.serialize(context.attribute, context.item, context.attributeName, context.container);
                var serialized = xmlSerializer.serializeToString(serializer.DOM);
                if (serialized == "<__InitialRoot/>") continue;
                this.serialized += serialized;
            }
        }
            		
        /*
         // updateSectorOrigin
         const char* substr = NULL;
         std.prototype.string name = "";
         if ((substr = strstr(this.serialized.c_str(), "PerspectiveCamera")) ||
         (substr = strstr(this.serialized.c_str(), "OrthographicCamera")))
         {
         if (substr = strstr(substr, "<name>"))
         {
         substr += 6; // skip "<name>"
         while (*substr != '<')
         {
         name += *substr++;
         }

         this.serialized += ".set target=\"";
         this.serialized += name;
         this.serialized += "\" updateSectorOrigin=\"true\"/>";
         }
         }
         */
        // TODO: pivotCone
    }

    // root element close tag
    this.serialized += "</Session>";
    serializedScene += this.serialized;
    //console.log(this.serialized);

    return;
}

SerializeCommand.prototype.undo = function()
{

}

SerializeCommand.prototype.setRegistry = function(registry)
{
    // create serialize directive
    var factory = bridgeworks.registry.find("AttributeFactory");
    this.directive = factory.create("SerializeDirective");

    // call base-class implementation
    Command.prototype.setRegistry.call(this, registry);
}

SerializeCommand.prototype.getSerialized = function()
{
    return this.serialized;
}

function SerializeCommand_TargetModifiedCB(attribute, container)
{
    var target = attribute.getValueDirect().join("");
    container.targetAttribute = container.registry.find(target);
}